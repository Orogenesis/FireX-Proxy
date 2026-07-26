import { browser } from 'wxt/browser';
import { DefaultProxyCheckerSettings, DefaultProxySources } from '../core/constants';
import type {
  ExtensionStorage,
  CheckerVersionManifest,
  NativeCheckerHostSnapshot,
  ProxyCheckRun,
  ProxyCheckerSettings,
  ProxyEndpoint,
  ProxyHealthResult,
  ProxySourceSettings,
  ProxySourceSync
} from '../core/types';

const defaultSource: ProxySourceSettings = { urls: [...DefaultProxySources] };
const defaultCheckerRun: ProxyCheckRun = {
  status: 'idle',
  checked: 0,
  total: 0,
  working: 0,
  failed: 0,
  queued: 0
};
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

  async getSourceAutoSyncAttemptedAt(): Promise<number | undefined> {
    return (await this.getAll()).sourceAutoSyncAttemptedAt;
  }

  async setSourceAutoSyncAttemptedAt(sourceAutoSyncAttemptedAt: number): Promise<void> {
    await browser.storage.local.set({ sourceAutoSyncAttemptedAt });
  }

  async getCheckerHost(): Promise<NativeCheckerHostSnapshot> {
    return (await this.getAll()).checkerHost || { status: 'unknown' };
  }

  async setCheckerHost(checkerHost: NativeCheckerHostSnapshot): Promise<void> {
    await browser.storage.local.set({ checkerHost });
  }

  async getCheckerVersionManifest(): Promise<CheckerVersionManifest | undefined> {
    return (await this.getAll()).checkerVersionManifest;
  }

  async setCheckerVersionManifest(checkerVersionManifest: CheckerVersionManifest): Promise<void> {
    await browser.storage.local.set({ checkerVersionManifest });
  }

  async getCheckerSettings(): Promise<ProxyCheckerSettings> {
    const settings = (await this.getAll()).checkerSettings;

    return this.normalizeCheckerSettings(settings);
  }

  async setCheckerSettings(settings: ProxyCheckerSettings): Promise<void> {
    await browser.storage.local.set({ checkerSettings: this.normalizeCheckerSettings(settings) });
  }

  async getCheckerRun(): Promise<ProxyCheckRun> {
    return (await this.getAll()).checkerRun || defaultCheckerRun;
  }

  async setCheckerRun(checkerRun: ProxyCheckRun): Promise<void> {
    await browser.storage.local.set({ checkerRun });
  }

  async getProxyHealth(): Promise<Record<string, ProxyHealthResult>> {
    return (await this.getAll()).proxyHealth || {};
  }

  async setProxyHealth(proxyHealth: Record<string, ProxyHealthResult>): Promise<void> {
    await browser.storage.local.set({ proxyHealth });
  }

  private normalizeRules(rules: string[]): string[] {
    return [...new Set(rules.map(rule => rule.trim()).filter(Boolean))];
  }

  private normalizeSourceUrls(urls: string[]): string[] {
    return this.normalizeRules([...DefaultProxySources, ...urls]);
  }

  private normalizeCheckerSettings(settings?: Partial<ProxyCheckerSettings>): ProxyCheckerSettings {
    const defaults = DefaultProxyCheckerSettings;
    const maxWorking = this.clampInteger(settings?.maxWorking, 1, 500, defaults.maxWorking);
    const maxCandidates = this.clampInteger(settings?.maxCandidates, maxWorking, 20_000, defaults.maxCandidates);

    return {
      enabled: settings?.enabled ?? defaults.enabled,
      maxWorking,
      maxCandidates,
      concurrency: this.clampInteger(settings?.concurrency, 1, 512, defaults.concurrency),
      timeoutMs: this.clampInteger(settings?.timeoutMs, 1_000, 30_000, defaults.timeoutMs),
      recheckIntervalMinutes: this.clampInteger(
        settings?.recheckIntervalMinutes,
        5,
        24 * 60,
        defaults.recheckIntervalMinutes
      ),
      targets: this.normalizeRules(settings?.targets?.length ? settings.targets : [...defaults.targets])
    };
  }

  private clampInteger(value: unknown, min: number, max: number, fallback: number): number {
    if (typeof value !== 'number' || !Number.isFinite(value)) {
      return fallback;
    }

    return Math.min(Math.max(Math.round(value), min), max);
  }
}
