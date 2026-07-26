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
  | { type: 'source:sync' };

export type ExtensionResponse = ProxySnapshot | ProxyEndpoint | void;

export interface ExtensionStorage {
  proxies?: ProxyEndpoint[];
  activeProxyId?: string;
  bypassRules?: string[];
  source?: ProxySourceSettings;
  sourceSync?: ProxySourceSync;
  sourceAutoSyncAttemptedAt?: number;
  installedAt?: number;
}
