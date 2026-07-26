import { ProxyProtocols } from '../../core/constants';
import type { ProxyDraft, ProxyEndpoint as ProxyEndpointData, ProxyProtocol } from '../../core/types';

export class ProxyEndpointRecord {
  private constructor(private readonly data: ProxyEndpointData) {}

  static fromDraft(draft: ProxyDraft): ProxyEndpointRecord {
    const host = draft.host.trim();
    const port = Number(draft.port);

    if (!host) {
      throw new Error('Hostname is required.');
    }

    if (!Number.isInteger(port) || port < 1 || port > 65535) {
      throw new Error('Port must be 1-65535.');
    }

    return new ProxyEndpointRecord({
      id: ProxyEndpointRecord.createId(draft.protocol, host, port),
      host,
      port,
      protocol: draft.protocol,
      name: draft.name?.trim() || undefined,
      createdAt: Date.now()
    });
  }

  static hydrate(proxy: ProxyEndpointData): ProxyEndpointRecord {
    const protocol = ProxyEndpointRecord.normalizeProtocol(proxy.protocol);
    if (!protocol) {
      throw new Error(`Unsupported proxy protocol: ${proxy.protocol}`);
    }

    return new ProxyEndpointRecord({
      ...proxy,
      protocol,
      host: proxy.host.trim(),
      id: proxy.id || ProxyEndpointRecord.createId(protocol, proxy.host, proxy.port),
      createdAt: proxy.createdAt || Date.now()
    });
  }

  static createId(protocol: ProxyProtocol, host: string, port: number): string {
    return `${protocol}:${host.toLowerCase()}:${port}`;
  }

  static normalizeProtocol(protocol?: string): ProxyProtocol | null {
    const value = protocol?.toUpperCase();
    return ProxyProtocols.includes(value as ProxyProtocol) ? (value as ProxyProtocol) : null;
  }

  get id(): string {
    return this.data.id;
  }

  rename(name: string): ProxyEndpointRecord {
    return new ProxyEndpointRecord({ ...this.data, name: name.trim() || undefined });
  }

  toJSON(): ProxyEndpointData {
    return { ...this.data };
  }
}
