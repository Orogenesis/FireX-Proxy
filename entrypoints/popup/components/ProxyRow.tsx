import { CheckCircle2, PlugZap, Power, Trash2, XCircle } from 'lucide-react';
import type { ProxyEndpoint, ProxyHealthResult } from '../../../src/core/types';
import { createdAtLabel, endpointAddress, endpointLabel } from '../../../src/ui/format';

interface ProxyRowProps {
  active: boolean;
  busy: boolean;
  health?: ProxyHealthResult;
  proxy: ProxyEndpoint;
  onConnect(proxy: ProxyEndpoint): void;
  onDisconnect(): void;
  onRemove(proxyId: string): void;
}

export function ProxyRow({ active, busy, health, proxy, onConnect, onDisconnect, onRemove }: ProxyRowProps) {
  return (
    <article className={active ? 'proxyRow active' : 'proxyRow'}>
      <div className="proxyBody">
        <div className="proxyTitle">
          <strong>{endpointLabel(proxy)}</strong>
          <HealthBadge health={health} />
        </div>
        <span>{endpointAddress(proxy)}</span>
        <small>{proxy.protocol} - added {createdAtLabel(proxy)}</small>
      </div>
      <div className="rowActions">
        <button
          className={active ? 'iconButton danger' : 'iconButton'}
          disabled={busy}
          title={active ? 'Disconnect' : 'Connect'}
          onClick={() => active ? onDisconnect() : onConnect(proxy)}
        >
          {active ? <Power size={17} /> : <PlugZap size={17} />}
        </button>
        <button className="iconButton ghost" disabled={busy} title="Remove" onClick={() => onRemove(proxy.id)}>
          <Trash2 size={17} />
        </button>
      </div>
    </article>
  );
}

function HealthBadge({ health }: { health?: ProxyHealthResult }) {
  if (!health) {
    return null;
  }

  if (health.status === 'working') {
    const label = health.latencyMs ? `Working, ${health.latencyMs} ms` : 'Working';

    return (
      <span className="healthBadge working" aria-label={label}>
        <CheckCircle2 size={12} />
        {health.latencyMs && <span>{health.latencyMs} ms</span>}
      </span>
    );
  }

  const label = health.error ? `Failed health check: ${health.error}` : 'Failed health check';

  return (
    <span className="healthBadge failed" aria-label={label}>
      <XCircle size={12} />
    </span>
  );
}
