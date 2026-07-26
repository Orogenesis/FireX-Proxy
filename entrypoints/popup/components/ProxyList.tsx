import { useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import type { ProxyEndpoint } from '../../../src/core/types';
import { ProxyRow } from './ProxyRow';

interface ProxyListProps {
  activeProxyId?: string;
  busy: boolean;
  loading: boolean;
  syncing: boolean;
  proxies: ProxyEndpoint[];
  onConnect(proxy: ProxyEndpoint): void;
  onRemove(proxyId: string): void;
}

export function ProxyList({ activeProxyId, busy, loading, syncing, proxies, onConnect, onRemove }: ProxyListProps) {
  const scrollParentRef = useRef<HTMLDivElement>(null);
  const virtualizer = useVirtualizer({
    count: proxies.length,
    getScrollElement: () => scrollParentRef.current,
    estimateSize: () => 82,
    getItemKey: index => proxies[index]?.id ?? index,
    overscan: 8
  });

  if (loading || syncing) {
    return (
      <div className="empty loadingState">
        <span className="spinner" />
        {syncing ? 'Syncing proxy sources' : 'Loading proxies'}
      </div>
    );
  }

  if (proxies.length === 0) {
    return <div className="empty">No proxies yet. Add one above.</div>;
  }

  return (
    <section ref={scrollParentRef} className="proxyList" aria-label="Proxy list">
      <div className="proxyVirtualCanvas" style={{ height: `${virtualizer.getTotalSize()}px` }}>
        {virtualizer.getVirtualItems().map(virtualRow => {
          const proxy = proxies[virtualRow.index];

          if (!proxy) {
            return null;
          }

          return (
            <div
              key={proxy.id}
              className="proxyVirtualRow"
              style={{
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`
              }}
            >
              <ProxyRow
                active={proxy.id === activeProxyId}
                busy={busy}
                proxy={proxy}
                onConnect={onConnect}
                onRemove={onRemove}
              />
            </div>
          );
        })}
      </div>
    </section>
  );
}
