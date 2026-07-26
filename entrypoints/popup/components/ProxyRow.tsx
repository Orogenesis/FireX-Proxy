import { PlugZap, Trash2 } from 'lucide-react';
import type { ProxyEndpoint } from '../../../src/core/types';
import { createdAtLabel, endpointAddress, endpointLabel } from '../../../src/ui/format';

interface ProxyRowProps {
  active: boolean;
  busy: boolean;
  proxy: ProxyEndpoint;
  onConnect(proxy: ProxyEndpoint): void;
  onRemove(proxyId: string): void;
}

export function ProxyRow({ active, busy, proxy, onConnect, onRemove }: ProxyRowProps) {
  return (
    <article className={active ? 'proxyRow active' : 'proxyRow'}>
      <div className="proxyBody">
        <div className="proxyTitle">
          <strong>{endpointLabel(proxy)}</strong>
        </div>
        <span>{endpointAddress(proxy)}</span>
        <small>{proxy.protocol} - added {createdAtLabel(proxy)}</small>
      </div>
      <div className="rowActions">
        <button className={active ? 'iconButton success' : 'iconButton'} disabled={busy || active} title="Connect" onClick={() => onConnect(proxy)}>
          <PlugZap size={17} />
        </button>
        <button className="iconButton ghost" disabled={busy} title="Remove" onClick={() => onRemove(proxy.id)}>
          <Trash2 size={17} />
        </button>
      </div>
    </article>
  );
}
