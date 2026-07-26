import { ProxySourceAutoSyncIntervalMs } from '../core/constants';
import type { ProxyEndpoint, ProxySourceSettings, ProxySourceSync } from '../core/types';
import { ProxyCatalog } from '../domain/proxy/ProxyCatalog';
import { ProxySourceParser } from '../domain/source/ProxySourceParser';
import { HostPermissionService } from './HostPermissionService';
import { StorageRepository } from './StorageRepository';

export class ProxySourceService {
  constructor(
    private readonly storage: StorageRepository,
    private readonly permissions: HostPermissionService,
    private readonly parser: ProxySourceParser
  ) {}

  async setSource(source: ProxySourceSettings): Promise<void> {
    for (const url of source.urls) {
      if (url.trim()) {
        this.validateUrl(url);
      }
    }

    await this.storage.setSource(source);
  }

  async autoSync(): Promise<boolean> {
    const now = Date.now();
    const lastAutoSyncAttemptedAt = await this.storage.getSourceAutoSyncAttemptedAt();
    const lastSourceSync = await this.storage.getSourceSync();
    const lastSyncActivityAt = Math.max(lastAutoSyncAttemptedAt ?? 0, lastSourceSync?.syncedAt ?? 0);

    if (lastSyncActivityAt && now - lastSyncActivityAt < ProxySourceAutoSyncIntervalMs) {
      return false;
    }

    await this.storage.setSourceAutoSyncAttemptedAt(now);

    const source = await this.storage.getSource();
    const urls = source.urls.map(url => this.validateUrl(url));

    for (const url of urls) {
      if (!await this.permissions.hasUrlAccess(url.href)) {
        return false;
      }
    }

    await this.sync();
    return true;
  }

  async sync(): Promise<ProxySourceSync> {
    const source = await this.storage.getSource();
    const urls = source.urls.map(url => this.validateUrl(url));

    if (urls.length === 0) {
      throw new Error('Add at least one source URL before syncing.');
    }

    let importedProxies: ProxyEndpoint[] = [];
    const results = [];

    for (const url of urls) {
      if (!await this.permissions.hasUrlAccess(url.href)) {
        throw new Error(`Source host permission is missing: ${url.host}`);
      }

      const response = await fetch(url.href, { cache: 'no-store' });
      if (!response.ok) {
        throw new Error(`Source fetch failed for ${url.href}: ${response.status}`);
      }

      const content = await response.text();
      const parsed = this.parser.parse(content);
      const bytes = new TextEncoder().encode(content).byteLength;

      importedProxies = [...importedProxies, ...parsed.proxies];
      results.push({
        url: url.href,
        bytes,
        imported: parsed.proxies.length
      });
    }

    const merged = this.mergeProxies(await this.storage.getProxies(), importedProxies);
    const sourceSync = {
      syncedAt: Date.now(),
      bytes: results.reduce((sum, result) => sum + result.bytes, 0),
      imported: importedProxies.length,
      sources: results
    };

    await this.storage.setProxies(merged);
    await this.storage.setSourceSync(sourceSync);
    return sourceSync;
  }

  private mergeProxies(existing: ProxyEndpoint[], imported: ProxyEndpoint[]): ProxyEndpoint[] {
    return ProxyCatalog.fromStorage(existing)
      .merge(ProxyCatalog.fromStorage(imported))
      .toJSON();
  }

  private validateUrl(value: string): URL {
    const url = new URL(value.trim());

    if (url.protocol !== 'https:' && url.protocol !== 'http:') {
      throw new Error('Source URL must use HTTP or HTTPS.');
    }

    return url;
  }
}
