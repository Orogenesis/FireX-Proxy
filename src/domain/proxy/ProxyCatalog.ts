import type { ProxyEndpoint } from '../../core/types';
import { ProxyEndpointRecord } from './ProxyEndpoint';

export class ProxyCatalog {
  private readonly proxies: ProxyEndpointRecord[];

  constructor(proxies: ProxyEndpointRecord[] = []) {
    this.proxies = proxies;
  }

  static fromStorage(proxies: ProxyEndpoint[] = []): ProxyCatalog {
    const records = proxies.flatMap(proxy => {
      try {
        return [ProxyEndpointRecord.hydrate(proxy)];
      } catch {
        return [];
      }
    });

    return new ProxyCatalog(records).deduplicate();
  }

  add(proxy: ProxyEndpointRecord): ProxyCatalog {
    return new ProxyCatalog([proxy, ...this.proxies.filter(item => item.id !== proxy.id)]);
  }

  merge(other: ProxyCatalog): ProxyCatalog {
    return new ProxyCatalog([...this.proxies, ...other.proxies]).deduplicate();
  }

  update(proxy: ProxyEndpoint): ProxyCatalog {
    const record = ProxyEndpointRecord.hydrate(proxy);
    return new ProxyCatalog(this.proxies.map(item => item.id === record.id ? record : item)).deduplicate();
  }

  remove(proxyId: string): ProxyCatalog {
    return new ProxyCatalog(this.proxies.filter(proxy => proxy.id !== proxyId));
  }

  find(proxyId: string): ProxyEndpoint | undefined {
    return this.proxies.find(proxy => proxy.id === proxyId)?.toJSON();
  }

  has(proxyId: string): boolean {
    return this.proxies.some(proxy => proxy.id === proxyId);
  }

  toJSON(): ProxyEndpoint[] {
    return this.proxies
      .map(proxy => proxy.toJSON())
      .sort((a, b) => b.createdAt - a.createdAt);
  }

  private deduplicate(): ProxyCatalog {
    const seen = new Map<string, ProxyEndpointRecord>();

    for (const proxy of this.proxies) {
      seen.set(proxy.id, proxy);
    }

    return new ProxyCatalog([...seen.values()]);
  }
}
