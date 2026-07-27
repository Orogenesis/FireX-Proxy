import type {
  CheckerVersionManifest,
  NativeCheckerHostSnapshot,
  ProxyCheckerSettings,
  ProxyEndpoint,
  ProxyHealthResult,
  ProxyCheckRun
} from '../core/types';
import { NativeCheckerClient, type NativeCheckerMessage, type NativeCheckerSession } from './NativeCheckerClient';
import { CheckerManifestService } from './CheckerManifestService';
import { StorageRepository } from './StorageRepository';

export class ProxyCheckerService {
  private activeSession?: NativeCheckerSession;
  private runCache?: ProxyCheckRun;
  private healthCache?: Record<string, ProxyHealthResult>;
  private flushTimer?: ReturnType<typeof setTimeout>;

  constructor(
    private readonly storage: StorageRepository,
    private readonly nativeChecker: NativeCheckerClient,
    private readonly checkerManifest: CheckerManifestService
  ) {}

  async probe(): Promise<NativeCheckerHostSnapshot> {
    const checkedAt = Date.now();

    try {
      const pong = await this.nativeChecker.ping();
      const manifest = await this.checkerManifest.getManifest();
      const host: NativeCheckerHostSnapshot = {
        ...this.checkerVersionStatus(pong.version, pong.protocolVersion, manifest),
        version: pong.version,
        latestVersion: manifest.latestVersion,
        minimumVersion: manifest.minimumVersion,
        protocolVersion: pong.protocolVersion,
        requiredProtocolVersion: manifest.protocolVersion,
        releaseUrl: manifest.releaseUrl,
        checkedAt
      };

      await this.storage.setCheckerHost(host);
      return host;
    } catch (cause) {
      const host: NativeCheckerHostSnapshot = {
        status: 'missing',
        checkedAt,
        message: cause instanceof Error ? cause.message : 'FireX Native is not installed.'
      };

      await this.storage.setCheckerHost(host);
      return host;
    }
  }

  async setSettings(settings: ProxyCheckerSettings): Promise<void> {
    await this.storage.setCheckerSettings(settings);
  }

  async start(proxies: ProxyEndpoint[]): Promise<void> {
    if (this.activeSession) {
      return;
    }

    const settings = await this.storage.getCheckerSettings();
    const host = await this.probe();

    if (host.status !== 'available' && host.status !== 'update_available') {
      await this.storage.setCheckerRun(this.errorRun(host.message || 'FireX Native is not available.'));
      return;
    }

    if (proxies.length === 0) {
      await this.storage.setCheckerRun(this.errorRun('There are no proxies to check.'));
      return;
    }

    const health = await this.storage.getProxyHealth();
    const candidates = this.pickCandidates(proxies, health, settings);
    const startedAt = Date.now();
    const session = this.nativeChecker.check(candidates, settings, message => this.handleNativeMessage(message));

    this.activeSession = session;
    this.healthCache = health;
    this.runCache = {
      status: 'checking',
      requestId: session.requestId,
      checked: 0,
      total: candidates.length,
      working: 0,
      failed: 0,
      queued: candidates.length,
      startedAt
    };

    await this.storage.setCheckerRun(this.runCache);

    void session.done
      .catch(cause => this.failActiveRun(cause))
      .finally(() => {
        if (this.activeSession?.requestId === session.requestId) {
          this.activeSession = undefined;
        }

        void this.flush();
      });
  }

  async startIfDue(proxies: ProxyEndpoint[]): Promise<void> {
    const settings = await this.storage.getCheckerSettings();

    if (!settings.enabled || this.activeSession || proxies.length === 0) {
      return;
    }

    const run = await this.storage.getCheckerRun();
    const lastFinishedAt = run.finishedAt || run.startedAt || 0;
    const intervalMs = settings.recheckIntervalMinutes * 60 * 1000;

    if (lastFinishedAt && Date.now() - lastFinishedAt < intervalMs) {
      return;
    }

    await this.start(proxies);
  }

  async stop(): Promise<void> {
    const session = this.activeSession;

    if (!session) {
      return;
    }

    session.stop();
    this.activeSession = undefined;
    this.runCache = {
      ...(this.runCache || await this.storage.getCheckerRun()),
      status: 'finished',
      finishedAt: Date.now(),
      message: 'Checker stopped.'
    };

    await this.flush();
  }

  private handleNativeMessage(message: NativeCheckerMessage): void {
    if (message.type === 'check_started') {
      this.runCache = {
        status: 'checking',
        requestId: message.requestId,
        checked: 0,
        total: message.total,
        working: 0,
        failed: 0,
        queued: message.total,
        startedAt: Date.now()
      };
      this.scheduleFlush();
      return;
    }

    if (message.type === 'proxy_checked') {
      this.healthCache = {
        ...(this.healthCache || {}),
        [message.result.proxyId]: message.result
      };
      this.scheduleFlush();
      return;
    }

    if (message.type === 'progress') {
      this.runCache = {
        ...(this.runCache || this.emptyRun()),
        status: 'checking',
        requestId: message.requestId,
        checked: message.checked,
        total: message.total,
        working: message.working,
        failed: message.failed,
        queued: message.queued
      };
      this.scheduleFlush();
      return;
    }

    if (message.type === 'check_finished') {
      this.runCache = {
        ...(this.runCache || this.emptyRun()),
        status: 'finished',
        requestId: message.requestId,
        checked: message.checked,
        total: message.total,
        working: message.working,
        failed: message.failed,
        queued: 0,
        finishedAt: Date.now(),
        message: message.stoppedAfterGoal ? 'Working proxy target reached.' : undefined
      };
      void this.flush();
      return;
    }

    if (message.type === 'error') {
      void this.failActiveRun(new Error(message.message));
    }
  }

  private async failActiveRun(cause: unknown): Promise<void> {
    this.runCache = {
      ...(this.runCache || this.emptyRun()),
      status: 'error',
      finishedAt: Date.now(),
      message: cause instanceof Error ? cause.message : 'Proxy check failed.'
    };

    await this.flush();
  }

  private scheduleFlush(): void {
    if (this.flushTimer) {
      return;
    }

    this.flushTimer = setTimeout(() => {
      void this.flush();
    }, 400);
  }

  private async flush(): Promise<void> {
    if (this.flushTimer) {
      clearTimeout(this.flushTimer);
      this.flushTimer = undefined;
    }

    const writes = [];

    if (this.runCache) {
      writes.push(this.storage.setCheckerRun(this.runCache));
    }

    if (this.healthCache) {
      writes.push(this.storage.setProxyHealth(this.healthCache));
    }

    await Promise.all(writes);
  }

  private pickCandidates(
    proxies: ProxyEndpoint[],
    health: Record<string, ProxyHealthResult>,
    settings: ProxyCheckerSettings
  ): ProxyEndpoint[] {
    return [...proxies]
      .sort((left, right) => this.healthPriority(left, health) - this.healthPriority(right, health))
      .slice(0, settings.maxCandidates);
  }

  private healthPriority(proxy: ProxyEndpoint, health: Record<string, ProxyHealthResult>): number {
    const result = health[proxy.id];

    if (!result) {
      return 1;
    }

    if (result.status === 'working') {
      return 0;
    }

    return 2;
  }

  private errorRun(message: string): ProxyCheckRun {
    return {
      ...this.emptyRun(),
      status: 'error',
      finishedAt: Date.now(),
      message
    };
  }

  private emptyRun(): ProxyCheckRun {
    return {
      status: 'idle',
      checked: 0,
      total: 0,
      working: 0,
      failed: 0,
      queued: 0
    };
  }

  private compareVersion(left: string, right: string): number {
    const leftParts = this.versionParts(left);
    const rightParts = this.versionParts(right);

    for (let index = 0; index < Math.max(leftParts.length, rightParts.length); index += 1) {
      const leftPart = leftParts[index] || 0;
      const rightPart = rightParts[index] || 0;

      if (leftPart !== rightPart) {
        return leftPart > rightPart ? 1 : -1;
      }
    }

    return 0;
  }

  private checkerVersionStatus(
    version: string,
    protocolVersion: number,
    manifest: CheckerVersionManifest
  ): Pick<NativeCheckerHostSnapshot, 'status' | 'message'> {
    if (protocolVersion !== manifest.protocolVersion) {
      return {
        status: 'outdated',
        message: `Install FireX Native ${manifest.minimumVersion} or newer.`
      };
    }

    if (this.compareVersion(version, manifest.minimumVersion) < 0) {
      return {
        status: 'outdated',
        message: `Install FireX Native ${manifest.minimumVersion} or newer.`
      };
    }

    if (this.compareVersion(version, manifest.latestVersion) < 0) {
      return {
        status: 'update_available',
        message: `FireX Native ${manifest.latestVersion} is available.`
      };
    }

    return { status: 'available' };
  }

  private versionParts(version: string): number[] {
    return version
      .split(/[.-]/)
      .map(part => Number.parseInt(part, 10))
      .filter(part => Number.isFinite(part));
  }
}
