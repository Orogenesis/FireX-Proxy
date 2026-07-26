import { browser } from 'wxt/browser';
import { DefaultProxySources } from '../core/constants';
import type { ExtensionStorage, ProxyEndpoint, ProxySourceSettings, ProxySourceSync } from '../core/types';

const defaultSource: ProxySourceSettings = { urls: [...DefaultProxySources] };
type StoredSource = ProxySourceSettings & { url?: string };

export class StorageRepository {
  async getAll(): Promise<ExtensionStorage> {
    return browser.storage.local.get() as Promise<ExtensionStorage>;
  }

  async markInstalled(): Promise<void> {
    const { installedAt } = await this.getAll();

    if (!installedAt) {
      await browser.storage.local.set({ installedAt: Date.now() });
    }
  }

  async getProxies(): Promise<ProxyEndpoint[]> {
    return (await this.getAll()).proxies || [];
  }

  async setProxies(proxies: ProxyEndpoint[]): Promise<void> {
    await browser.storage.local.set({ proxies });
  }

  async getActiveProxyId(): Promise<string | undefined> {
    return (await this.getAll()).activeProxyId;
  }

  async setActiveProxyId(proxyId: string): Promise<void> {
    await browser.storage.local.set({ activeProxyId: proxyId });
  }

  async clearActiveProxyId(): Promise<void> {
    await browser.storage.local.remove('activeProxyId');
  }

  async getBypassRules(): Promise<string[]> {
    return (await this.getAll()).bypassRules || [];
  }

  async setBypassRules(rules: string[]): Promise<void> {
    await browser.storage.local.set({ bypassRules: this.normalizeRules(rules) });
  }

  async getSource(): Promise<ProxySourceSettings> {
    const source = (await this.getAll()).source as StoredSource | undefined;

    if (!source) {
      return defaultSource;
    }

    return {
      urls: this.normalizeSourceUrls(source.urls || (source.url ? [source.url] : []))
    };
  }

  async setSource(source: ProxySourceSettings): Promise<void> {
    await browser.storage.local.set({ source: { urls: this.normalizeSourceUrls(source.urls) } });
  }

  async getSourceSync(): Promise<ProxySourceSync | undefined> {
    return (await this.getAll()).sourceSync;
  }

  async setSourceSync(sourceSync: ProxySourceSync): Promise<void> {
    await browser.storage.local.set({ sourceSync });
  }

  private normalizeRules(rules: string[]): string[] {
    return [...new Set(rules.map(rule => rule.trim()).filter(Boolean))];
  }

  private normalizeSourceUrls(urls: string[]): string[] {
    return this.normalizeRules([...DefaultProxySources, ...urls]);
  }
}
