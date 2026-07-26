import { useMemo, useRef, useState } from 'react';
import { Database, Globe, Server, SlidersHorizontal } from 'lucide-react';
import { BypassRules } from './components/BypassRules';
import { CheckerSettingsPanel, CheckerStatusPanel } from './components/CheckerPanel';
import { Header } from './components/Header';
import { Notice } from './components/Notice';
import { ProxyForm } from './components/ProxyForm';
import { ProxyList } from './components/ProxyList';
import { ProxySource } from './components/ProxySource';
import { Tabs, type PopupTab } from './components/Tabs';
import { useProxyStore } from '../../src/ui/hooks/useProxyStore';

const tabs = [
  { id: 'proxies', label: 'Proxies', icon: <Server size={16} /> },
  { id: 'bypass', label: 'Bypass', icon: <Globe size={16} /> },
  { id: 'source', label: 'Source', icon: <Database size={16} /> },
  { id: 'settings', label: 'Settings', icon: <SlidersHorizontal size={16} /> }
] satisfies Array<{ id: PopupTab; label: string; icon: React.ReactNode }>;

export default function App() {
  const proxies = useProxyStore();
  const contentRef = useRef<HTMLElement>(null);
  const [activeTab, setActiveTab] = useState<PopupTab>('proxies');
  const checkedProxyCount = useMemo(
    () => proxies.proxies.filter(proxy => proxies.checker.results[proxy.id]).length,
    [proxies.checker.results, proxies.proxies]
  );
  const visibleProxies = useMemo(() => {
    if (checkedProxyCount === 0) {
      return proxies.proxies;
    }

    return proxies.proxies.filter(proxy => proxies.checker.results[proxy.id]?.status === 'working');
  }, [checkedProxyCount, proxies.checker.results, proxies.proxies]);

  return (
    <main className="shell">
      <Header
        activeProxy={proxies.activeProxy}
        busy={proxies.busy}
        checkerHost={proxies.checker.host}
        onDisconnect={proxies.disconnectProxy}
      />
      <Notice message={proxies.error} />
      <Tabs activeTab={activeTab} tabs={tabs} onChange={setActiveTab} />
      <section className="content" ref={contentRef}>
        {activeTab === 'proxies' && (
          <div className="tabPanel">
            <ProxyForm busy={proxies.busy} onSubmit={proxies.addProxy} />
            <CheckerStatusPanel
              busy={proxies.busy}
              checker={proxies.checker}
              checkedProxyCount={checkedProxyCount}
              proxyCount={proxies.proxies.length}
              visibleProxyCount={visibleProxies.length}
              onStart={proxies.startChecker}
              onStop={proxies.stopChecker}
            />
            <ProxyList
              activeProxyId={proxies.activeProxyId}
              busy={proxies.busy}
              loading={proxies.loading}
              syncing={proxies.syncing}
              proxies={visibleProxies}
              healthResults={proxies.checker.results}
              emptyMessage={checkedProxyCount > 0 ? 'No working proxies found.' : undefined}
              scrollParentRef={contentRef}
              onConnect={proxies.connectProxy}
              onDisconnect={proxies.disconnectProxy}
              onRemove={proxies.removeProxy}
            />
          </div>
        )}

        {activeTab === 'bypass' && (
          <div className="tabPanel">
            <BypassRules busy={proxies.busy} rules={proxies.bypassRules} onChange={proxies.setBypassRules} />
          </div>
        )}

        {activeTab === 'source' && (
          <div className="tabPanel">
            <ProxySource
              busy={proxies.busy}
              syncing={proxies.syncing}
              source={proxies.source}
              sourceSync={proxies.sourceSync}
              onSave={proxies.setSourceUrls}
              onSync={proxies.syncSource}
            />
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="tabPanel">
            <CheckerSettingsPanel
              busy={proxies.busy}
              checker={proxies.checker}
              onSave={proxies.setCheckerSettings}
            />
          </div>
        )}
      </section>
    </main>
  );
}
