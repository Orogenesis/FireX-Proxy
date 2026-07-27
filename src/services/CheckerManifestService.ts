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

interface RemoteNativeManifest {
  schemaVersion: number;
  native: {
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
      throw new Error(`Native manifest fetch failed: ${response.status}`);
    }

    return this.parse(await response.json());
  }

  private parse(value: unknown): CheckerVersionManifest {
    const manifest = value as Partial<RemoteNativeManifest>;
    const native = manifest.native;

    if (
      manifest.schemaVersion !== 1
      || !native
      || !this.isVersion(native.latestVersion)
      || !this.isVersion(native.minimumVersion)
      || !Number.isInteger(native.protocolVersion)
      || typeof native.releaseUrl !== 'string'
      || !native.releaseUrl.startsWith('https://')
    ) {
      throw new Error('Native manifest is invalid.');
    }

    return {
      latestVersion: native.latestVersion,
      minimumVersion: native.minimumVersion,
      protocolVersion: native.protocolVersion,
      releaseUrl: native.releaseUrl,
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
