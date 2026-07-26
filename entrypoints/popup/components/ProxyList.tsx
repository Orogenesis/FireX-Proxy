import { type RefObject, useLayoutEffect, useRef, useState } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import type { ProxyEndpoint, ProxyHealthResult } from '../../../src/core/types';
import { ProxyRow } from './ProxyRow';

interface ProxyListProps {
  activeProxyId?: string;
  busy: boolean;
  loading: boolean;
  syncing: boolean;
  proxies: ProxyEndpoint[];
  healthResults: Record<string, ProxyHealthResult>;
  emptyMessage?: string;
  scrollParentRef: RefObject<HTMLElement>;
  onConnect(proxy: ProxyEndpoint): void;
  onDisconnect(): void;
  onRemove(proxyId: string): void;
}

export function ProxyList({
  activeProxyId,
  busy,
  loading,
  syncing,
  proxies,
  healthResults,
  emptyMessage,
  scrollParentRef,
  onConnect,
  onDisconnect,
  onRemove
}: ProxyListProps) {
  const listRef = useRef<HTMLElement>(null);
  const [scrollMargin, setScrollMargin] = useState(0);
  const virtualizer = useVirtualizer({
    count: proxies.length,
    getScrollElement: () => scrollParentRef.current,
    estimateSize: () => 82,
    getItemKey: index => proxies[index]?.id ?? index,
    scrollMargin,
    overscan: 8
  });

  useLayoutEffect(() => {
    const scrollParent = scrollParentRef.current;
    const list = listRef.current;

    if (!scrollParent || !list) {
      return;
    }

    const updateScrollMargin = () => {
      setScrollMargin(getScrollMargin(scrollParent, list));
    };
    const resizeObserver = new ResizeObserver(updateScrollMargin);

    updateScrollMargin();
    resizeObserver.observe(scrollParent);

    if (list.parentElement) {
      resizeObserver.observe(list.parentElement);
    }

    return () => resizeObserver.disconnect();
  }, [scrollParentRef]);

  if (loading || syncing) {
    return (
      <div className="empty loadingState">
        <span className="spinner" />
        {syncing ? 'Syncing proxy sources' : 'Loading proxies'}
      </div>
    );
  }

  if (proxies.length === 0) {
    return <div className="empty">{emptyMessage || 'No proxies yet. Add one above.'}</div>;
  }

  return (
    <section ref={listRef} className="proxyList" aria-label="Proxy list">
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
                transform: `translateY(${virtualRow.start - scrollMargin}px)`
              }}
            >
              <ProxyRow
                active={proxy.id === activeProxyId}
                busy={busy}
                health={healthResults[proxy.id]}
                proxy={proxy}
                onConnect={onConnect}
                onDisconnect={onDisconnect}
                onRemove={onRemove}
              />
            </div>
          );
        })}
      </div>
    </section>
  );
}

function getScrollMargin(scrollParent: HTMLElement | null, list: HTMLElement | null): number {
  if (!scrollParent || !list) {
    return 0;
  }

  const scrollRect = scrollParent.getBoundingClientRect();
  const listRect = list.getBoundingClientRect();
  return listRect.top - scrollRect.top + scrollParent.scrollTop;
}
