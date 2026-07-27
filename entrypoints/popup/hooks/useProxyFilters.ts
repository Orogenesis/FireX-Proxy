import { useCallback, useMemo, useState } from 'react';
import type { ProxyEndpoint, ProxyHealthResult, ProxyProtocol } from '../../../src/core/types';
import { endpointAddress, endpointLabel } from '../../../src/ui/format';

export type HealthFilter = 'default' | 'all' | 'working' | 'failed';
export type EffectiveHealthFilter = Exclude<HealthFilter, 'default'>;
export type ProtocolFilter = 'all' | ProxyProtocol | 'socks';

export interface ProxyFilterState {
  healthFilter: HealthFilter;
  protocolFilter: ProtocolFilter;
  query: string;
}

interface UseProxyFiltersInput {
  checkedProxyCount: number;
  healthResults: Record<string, ProxyHealthResult>;
  proxies: ProxyEndpoint[];
}

export function useProxyFilters({ checkedProxyCount, healthResults, proxies }: UseProxyFiltersInput) {
  const [state, setState] = useState<ProxyFilterState>({
    healthFilter: 'default',
    protocolFilter: 'all',
    query: ''
  });
  const effectiveHealthFilter = state.healthFilter === 'default'
    ? checkedProxyCount > 0 ? 'working' : 'all'
    : state.healthFilter;
  const filteredProxies = useMemo(
    () => filterProxies(proxies, healthResults, state.query, state.protocolFilter, effectiveHealthFilter),
    [effectiveHealthFilter, healthResults, proxies, state.protocolFilter, state.query]
  );
  const hasActiveFilters = state.query.trim().length > 0 || state.protocolFilter !== 'all' || state.healthFilter !== 'default';
  const setHealthFilter = useCallback((healthFilter: HealthFilter) => {
    setState(current => ({ ...current, healthFilter }));
  }, []);
  const setProtocolFilter = useCallback((protocolFilter: ProtocolFilter) => {
    setState(current => ({ ...current, protocolFilter }));
  }, []);
  const setQuery = useCallback((query: string) => {
    setState(current => ({ ...current, query }));
  }, []);
  const resetFilters = useCallback(() => {
    setState({ healthFilter: 'default', protocolFilter: 'all', query: '' });
  }, []);

  return {
    effectiveHealthFilter,
    filteredProxies,
    hasActiveFilters,
    state,
    setHealthFilter,
    setProtocolFilter,
    setQuery,
    resetFilters
  };
}

function filterProxies(
  proxies: ProxyEndpoint[],
  healthResults: Record<string, ProxyHealthResult>,
  query: string,
  protocolFilter: ProtocolFilter,
  healthFilter: EffectiveHealthFilter
): ProxyEndpoint[] {
  const normalizedQuery = query.trim().toLowerCase();

  return proxies.filter(proxy => {
    if (!matchesProtocol(proxy, protocolFilter)) {
      return false;
    }

    if (!matchesHealth(healthResults[proxy.id], healthFilter)) {
      return false;
    }

    if (!normalizedQuery) {
      return true;
    }

    return searchableProxyText(proxy).includes(normalizedQuery);
  });
}

function matchesProtocol(proxy: ProxyEndpoint, protocolFilter: ProtocolFilter): boolean {
  if (protocolFilter === 'all') {
    return true;
  }

  if (protocolFilter === 'socks') {
    return proxy.protocol === 'SOCKS4' || proxy.protocol === 'SOCKS5';
  }

  return proxy.protocol === protocolFilter;
}

function matchesHealth(health: ProxyHealthResult | undefined, healthFilter: EffectiveHealthFilter): boolean {
  if (healthFilter === 'all') {
    return true;
  }

  return health?.status === healthFilter;
}

function searchableProxyText(proxy: ProxyEndpoint): string {
  return [
    endpointLabel(proxy),
    endpointAddress(proxy),
    proxy.host,
    String(proxy.port),
    proxy.protocol
  ].join(' ').toLowerCase();
}
