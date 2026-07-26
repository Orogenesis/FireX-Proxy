import type { ProxyEndpoint } from '../../core/types';
import { ProxyEndpointRecord } from '../proxy/ProxyEndpoint';

export interface ParsedProxySource {
  proxies: ProxyEndpoint[];
}

export class ProxySourceParser {
  parse(content: string): ParsedProxySource {
    return {
      proxies: content
        .split(/\r?\n/)
        .flatMap((line, index) => this.parseLine(line, index))
    };
  }

  private parseLine(line: string, index: number): ProxyEndpoint[] {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) {
      return [];
    }

    const commentIndex = trimmed.indexOf('#');
    const value = commentIndex >= 0 ? trimmed.slice(0, commentIndex).trim() : trimmed;
    const name = commentIndex >= 0 ? trimmed.slice(commentIndex + 1).trim() : undefined;

    try {
      const url = new URL(value.trim());
      const protocol = ProxyEndpointRecord.normalizeProtocol(url.protocol.replace(':', ''));
      const port = Number(url.port);

      if (!protocol || !url.hostname || !Number.isInteger(port)) {
        return [];
      }

      return [
        ProxyEndpointRecord.fromDraft({
          protocol,
          host: url.hostname,
          port,
          name: name?.trim() || `Source proxy ${index + 1}`
        }).toJSON()
      ];
    } catch {
      return [];
    }
  }
}
