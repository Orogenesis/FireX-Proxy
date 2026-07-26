import type { ProxyDraft, ProxyEndpoint, ProxySnapshot } from '../core/types';
import { ProxyCatalog } from '../domain/proxy/ProxyCatalog';
import { ProxyEndpointRecord } from '../domain/proxy/ProxyEndpoint';
import { ProxyRoutingService } from './ProxyRoutingService';
import { StorageRepository } from './StorageRepository';

export class ProxyListService {
  constructor(
    private readonly storage: StorageRepository,
    private readonly routing: ProxyRoutingService
  ) {}

  async snapshot(): Promise<ProxySnapshot> {
    const catalog = ProxyCatalog.fromStorage(await this.storage.getProxies());
    const activeProxyId = await this.storage.getActiveProxyId();
    const bypassRules = await this.storage.getBypassRules();
    const source = await this.storage.getSource();
    const sourceSync = await this.storage.getSourceSync();
    const checker = {
      host: await this.storage.getCheckerHost(),
      settings: await this.storage.getCheckerSettings(),
      run: await this.storage.getCheckerRun(),
      results: await this.storage.getProxyHealth()
    };

    if (activeProxyId && !catalog.has(activeProxyId)) {
      await this.storage.clearActiveProxyId();
      return { proxies: catalog.toJSON(), bypassRules, source, sourceSync, checker };
    }

    return {
      proxies: catalog.toJSON(),
      activeProxyId,
      bypassRules,
      source,
      sourceSync,
      checker
    };
  }

  async add(draft: ProxyDraft): Promise<ProxyEndpoint> {
    const proxy = ProxyEndpointRecord.fromDraft(draft);
    const catalog = ProxyCatalog.fromStorage(await this.storage.getProxies()).add(proxy);

    await this.storage.setProxies(catalog.toJSON());
    return proxy.toJSON();
  }

  async update(proxy: ProxyEndpoint): Promise<ProxyEndpoint> {
    const catalog = ProxyCatalog.fromStorage(await this.storage.getProxies()).update(proxy);
    const nextProxy = catalog.find(proxy.id);

    if (!nextProxy) {
      throw new Error('Proxy not found.');
    }

    await this.storage.setProxies(catalog.toJSON());

    if ((await this.storage.getActiveProxyId()) === nextProxy.id) {
      await this.routing.connect(nextProxy, await this.storage.getBypassRules());
    }

    return nextProxy;
  }

  async remove(proxyId: string): Promise<void> {
    const activeProxyId = await this.storage.getActiveProxyId();
    const catalog = ProxyCatalog.fromStorage(await this.storage.getProxies()).remove(proxyId);

    await this.storage.setProxies(catalog.toJSON());

    if (activeProxyId === proxyId) {
      await this.disconnect();
    }
  }

  async connect(proxyId: string): Promise<void> {
    const proxy = ProxyCatalog.fromStorage(await this.storage.getProxies()).find(proxyId);

    if (!proxy) {
      throw new Error('Proxy not found.');
    }

    await this.routing.connect(proxy, await this.storage.getBypassRules());
    await this.storage.setActiveProxyId(proxy.id);
  }

  async disconnect(): Promise<void> {
    await this.routing.disconnect();
    await this.storage.clearActiveProxyId();
  }

  async restore(): Promise<void> {
    const snapshot = await this.snapshot();
    const activeProxy = snapshot.proxies.find(proxy => proxy.id === snapshot.activeProxyId);

    if (!activeProxy) {
      await this.routing.updateBadge();
      return;
    }

    await this.routing.connect(activeProxy, snapshot.bypassRules);
  }

  async setBypassRules(rules: string[]): Promise<ProxySnapshot> {
    await this.storage.setBypassRules(rules);

    const snapshot = await this.snapshot();
    const activeProxy = snapshot.proxies.find(proxy => proxy.id === snapshot.activeProxyId);

    if (activeProxy) {
      await this.routing.connect(activeProxy, snapshot.bypassRules);
    }

    return snapshot;
  }
}
