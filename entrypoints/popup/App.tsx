import { useState } from 'react';
import { Database, Globe, Server } from 'lucide-react';
import { BypassRules } from './components/BypassRules';
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
  { id: 'source', label: 'Source', icon: <Database size={16} /> }
] satisfies Array<{ id: PopupTab; label: string; icon: React.ReactNode }>;

export default function App() {
  const proxies = useProxyStore();
  const [activeTab, setActiveTab] = useState<PopupTab>('proxies');

  return (
    <main className="shell">
      <Header
        activeProxy={proxies.activeProxy}
        busy={proxies.busy}
        onDisconnect={proxies.disconnectProxy}
        onRefresh={proxies.refresh}
      />
      <Notice message={proxies.error} />
      <Tabs activeTab={activeTab} tabs={tabs} onChange={setActiveTab} />
      <section className="content">
        {activeTab === 'proxies' && (
          <div className="tabPanel">
            <ProxyForm busy={proxies.busy} onSubmit={proxies.addProxy} />
            <ProxyList
              activeProxyId={proxies.activeProxyId}
              busy={proxies.busy}
              loading={proxies.loading}
              syncing={proxies.syncing}
              proxies={proxies.proxies}
              onConnect={proxies.connectProxy}
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
      </section>
    </main>
  );
}
