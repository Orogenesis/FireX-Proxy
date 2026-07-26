import { Activity, AlertTriangle, CheckCircle2, ExternalLink, Power } from 'lucide-react';
import { NativeCheckerInstallGuideUrl } from '../../../src/core/constants';
import type { NativeCheckerHostSnapshot, ProxyEndpoint } from '../../../src/core/types';
import { endpointAddress, endpointLabel } from '../../../src/ui/format';

interface HeaderProps {
  activeProxy?: ProxyEndpoint;
  busy: boolean;
  checkerHost: NativeCheckerHostSnapshot;
  onDisconnect(): void;
}

export function Header({ activeProxy, busy, checkerHost, onDisconnect }: HeaderProps) {
  const checkerLabel = getCheckerLabel(checkerHost);
  const checkerTip = getCheckerTip(checkerHost);
  const checkerBadge = (
    <>
      {getCheckerIcon(checkerHost.status)}
      <span>{checkerLabel}</span>
      {isCheckerDownloadable(checkerHost) && <ExternalLink size={13} />}
    </>
  );

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
        {isCheckerDownloadable(checkerHost) ? (
          <a className={`checkerBadge ${checkerHost.status}`} href={NativeCheckerInstallGuideUrl} target="_blank" rel="noreferrer" title={checkerTip}>
            {checkerBadge}
          </a>
        ) : (
          <span className={`checkerBadge ${checkerHost.status}`} title={checkerTip}>
            {checkerBadge}
          </span>
        )}
        {activeProxy && (
          <button className="iconButton danger headerDisconnect" disabled={busy} title="Disconnect proxy" onClick={onDisconnect}>
            <Power size={15} />
          </button>
        )}
      </div>
    </header>
  );
}

function isCheckerDownloadable(host: NativeCheckerHostSnapshot): boolean {
  return host.status === 'missing' || host.status === 'outdated' || host.status === 'update_available';
}

function getCheckerLabel(host: NativeCheckerHostSnapshot): string {
  if (host.status === 'available') {
    return host.version ? `Checker ${host.version}` : 'Checker ready';
  }

  if (host.status === 'update_available') {
    return host.latestVersion ? `Update ${host.latestVersion}` : 'Update checker';
  }

  if (host.status === 'outdated') {
    return 'Update checker';
  }

  if (host.status === 'missing') {
    return 'Install checker';
  }

  return 'Checker';
}

function getCheckerTip(host: NativeCheckerHostSnapshot): string {
  if (host.status === 'available') {
    return 'Native checker is installed. It tests proxies locally and stores working results with latency.';
  }

  if (host.status === 'update_available') {
    return host.message || 'A newer native checker is available.';
  }

  if (host.status === 'outdated') {
    return host.message || 'Native checker is outdated. Open the installation guide to update it.';
  }

  if (host.status === 'missing') {
    return 'Open the installation guide to set up the native checker.';
  }

  return 'Native checker status. It is optional, but recommended for filtering dead proxies.';
}

function getCheckerIcon(status: NativeCheckerHostSnapshot['status']) {
  if (status === 'available' || status === 'update_available') {
    return <CheckCircle2 size={15} />;
  }

  if (status === 'missing' || status === 'outdated') {
    return <AlertTriangle size={15} />;
  }

  return <Activity size={15} />;
}
