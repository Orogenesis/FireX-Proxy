import {
  NativeCheckerFallbackLatestVersion,
  NativeCheckerFallbackMinimumVersion,
  NativeCheckerManifestCacheMs,
  NativeCheckerManifestUrl,
  NativeCheckerProtocolVersion,
  NativeCheckerReleaseUrl
} from '../core/constants';
import type { CheckerVersionManifest } from '../core/types';
import { StorageRepository } from './StorageRepository';

interface RemoteCheckerManifest {
  schemaVersion: number;
  checker: {
    latestVersion: string;
    minimumVersion: string;
    protocolVersion: number;
    releaseUrl: string;
  };
}

export class CheckerManifestService {
  constructor(private readonly storage: StorageRepository) {}

  async getManifest(): Promise<CheckerVersionManifest> {
    const cached = await this.storage.getCheckerVersionManifest();

    if (cached && Date.now() - cached.fetchedAt < NativeCheckerManifestCacheMs) {
      return cached;
    }

    try {
      const manifest = await this.fetchManifest();
      await this.storage.setCheckerVersionManifest(manifest);
      return manifest;
    } catch (cause) {
      if (cached) {
        return cached;
      }

      return this.fallbackManifest();
    }
  }

  private async fetchManifest(): Promise<CheckerVersionManifest> {
    const response = await fetch(NativeCheckerManifestUrl, { cache: 'no-store' });

    if (!response.ok) {
      throw new Error(`Checker manifest fetch failed: ${response.status}`);
    }

    return this.parse(await response.json());
  }

  private parse(value: unknown): CheckerVersionManifest {
    const manifest = value as Partial<RemoteCheckerManifest>;
    const checker = manifest.checker;

    if (
      manifest.schemaVersion !== 1
      || !checker
      || !this.isVersion(checker.latestVersion)
      || !this.isVersion(checker.minimumVersion)
      || !Number.isInteger(checker.protocolVersion)
      || typeof checker.releaseUrl !== 'string'
      || !checker.releaseUrl.startsWith('https://')
    ) {
      throw new Error('Checker manifest is invalid.');
    }

    return {
      latestVersion: checker.latestVersion,
      minimumVersion: checker.minimumVersion,
      protocolVersion: checker.protocolVersion,
      releaseUrl: checker.releaseUrl,
      fetchedAt: Date.now()
    };
  }

  private fallbackManifest(): CheckerVersionManifest {
    return {
      latestVersion: NativeCheckerFallbackLatestVersion,
      minimumVersion: NativeCheckerFallbackMinimumVersion,
      protocolVersion: NativeCheckerProtocolVersion,
      releaseUrl: NativeCheckerReleaseUrl,
      fetchedAt: 0
    };
  }

  private isVersion(value: unknown): value is string {
    return typeof value === 'string' && /^\d+\.\d+\.\d+(?:[-.][0-9A-Za-z]+)?$/.test(value);
  }
}
