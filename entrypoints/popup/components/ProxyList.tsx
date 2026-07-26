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
    <section className="proxyList">
      {proxies.map(proxy => (
        <ProxyRow
          key={proxy.id}
          active={proxy.id === activeProxyId}
          busy={busy}
          proxy={proxy}
          onConnect={onConnect}
          onRemove={onRemove}
        />
      ))}
    </section>
  );
}
