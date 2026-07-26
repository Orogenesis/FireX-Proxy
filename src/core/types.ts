import type { ProxyProtocols } from './constants';

export type ProxyProtocol = (typeof ProxyProtocols)[number];

export interface ProxyEndpoint {
  id: string;
  host: string;
  port: number;
  protocol: ProxyProtocol;
  name?: string;
  createdAt: number;
}

export interface ProxyDraft {
  host: string;
  port: number;
  protocol: ProxyProtocol;
  name?: string;
}

export interface ProxySnapshot {
  proxies: ProxyEndpoint[];
  activeProxyId?: string;
  bypassRules: string[];
  source: ProxySourceSettings;
  sourceSync?: ProxySourceSync;
  checker: ProxyCheckerSnapshot;
}

export interface ProxySourceSettings {
  urls: string[];
}

export interface ProxySourceSync {
  syncedAt: number;
  bytes: number;
  imported: number;
  sources: ProxySourceResult[];
}

export interface ProxySourceResult {
  url: string;
  bytes: number;
  imported: number;
}

export type ProxyHealthStatus = 'working' | 'failed';

export interface ProxyHealthResult {
  proxyId: string;
  status: ProxyHealthStatus;
  latencyMs?: number;
  checkedAt: number;
  error?: string;
}

export type NativeCheckerHostStatus = 'unknown' | 'available' | 'missing' | 'outdated' | 'update_available';

export interface NativeCheckerHostSnapshot {
  status: NativeCheckerHostStatus;
  version?: string;
  latestVersion?: string;
  minimumVersion?: string;
  protocolVersion?: number;
  requiredProtocolVersion?: number;
  releaseUrl?: string;
  message?: string;
  checkedAt?: number;
}

export interface CheckerVersionManifest {
  latestVersion: string;
  minimumVersion: string;
  protocolVersion: number;
  releaseUrl: string;
  fetchedAt: number;
}

export type ProxyCheckRunStatus = 'idle' | 'checking' | 'finished' | 'error';

export interface ProxyCheckRun {
  status: ProxyCheckRunStatus;
  requestId?: string;
  checked: number;
  total: number;
  working: number;
  failed: number;
  queued: number;
  startedAt?: number;
  finishedAt?: number;
  message?: string;
}

export interface ProxyCheckerSettings {
  enabled: boolean;
  maxWorking: number;
  maxCandidates: number;
  concurrency: number;
  timeoutMs: number;
  recheckIntervalMinutes: number;
  targets: string[];
}

export interface ProxyCheckerSnapshot {
  host: NativeCheckerHostSnapshot;
  settings: ProxyCheckerSettings;
  run: ProxyCheckRun;
  results: Record<string, ProxyHealthResult>;
}

export type ExtensionRequest =
  | { type: 'snapshot:get' }
  | { type: 'proxy:add'; proxy: ProxyDraft }
  | { type: 'proxy:update'; proxy: ProxyEndpoint }
  | { type: 'proxy:remove'; proxyId: string }
  | { type: 'proxy:connect'; proxyId: string }
  | { type: 'proxy:disconnect' }
  | { type: 'bypass:set'; rules: string[] }
  | { type: 'source:set'; source: ProxySourceSettings }
  | { type: 'source:auto-sync' }
  | { type: 'source:sync' }
  | { type: 'checker:probe' }
  | { type: 'checker:start' }
  | { type: 'checker:stop' }
  | { type: 'checker:settings'; settings: ProxyCheckerSettings };

export type ExtensionResponse = ProxySnapshot | ProxyEndpoint | void;

export interface ExtensionStorage {
  proxies?: ProxyEndpoint[];
  activeProxyId?: string;
  bypassRules?: string[];
  source?: ProxySourceSettings;
  sourceSync?: ProxySourceSync;
  sourceAutoSyncAttemptedAt?: number;
  checkerHost?: NativeCheckerHostSnapshot;
  checkerVersionManifest?: CheckerVersionManifest;
  checkerSettings?: ProxyCheckerSettings;
  checkerRun?: ProxyCheckRun;
  proxyHealth?: Record<string, ProxyHealthResult>;
  installedAt?: number;
}
