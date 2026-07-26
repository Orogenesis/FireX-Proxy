import { Power } from 'lucide-react';
import type { ProxyEndpoint } from '../../../src/core/types';
import { endpointAddress, endpointLabel } from '../../../src/ui/format';

interface HeaderProps {
  activeProxy?: ProxyEndpoint;
  busy: boolean;
  onDisconnect(): void;
}

export function Header({ activeProxy, busy, onDisconnect }: HeaderProps) {
  return (
    <header className="header">
      <div className="brand">
        <img src="/data/icons/action/icon-48.png" alt="" />
        <div>
          <h1>FireX Proxy</h1>
          <p>{activeProxy ? `${endpointLabel(activeProxy)} - ${endpointAddress(activeProxy)}` : 'System proxy'}</p>
        </div>
      </div>
      <div className="headerActions">
        {activeProxy && (
          <button className="iconButton danger" disabled={busy} title="Disconnect" onClick={onDisconnect}>
            <Power size={18} />
          </button>
        )}
      </div>
    </header>
  );
}
