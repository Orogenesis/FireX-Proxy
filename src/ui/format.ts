import type { ProxyEndpoint } from '../core/types';

export function endpointLabel(proxy: ProxyEndpoint): string {
  return proxy.name || `${proxy.protocol} ${proxy.host}:${proxy.port}`;
}

export function endpointAddress(proxy: ProxyEndpoint): string {
  return `${proxy.host}:${proxy.port}`;
}

export function createdAtLabel(proxy: ProxyEndpoint): string {
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(proxy.createdAt);
}
