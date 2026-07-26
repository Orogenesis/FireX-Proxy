import type { ReactNode } from 'react';

export type PopupTab = 'proxies' | 'bypass' | 'source';

interface TabDefinition {
  id: PopupTab;
  label: string;
  icon: ReactNode;
}

interface TabsProps {
  activeTab: PopupTab;
  tabs: TabDefinition[];
  onChange(tab: PopupTab): void;
}

export function Tabs({ activeTab, tabs, onChange }: TabsProps) {
  return (
    <nav className="tabs" aria-label="Popup sections">
      {tabs.map(tab => (
        <button
          key={tab.id}
          className={activeTab === tab.id ? 'tab active' : 'tab'}
          onClick={() => onChange(tab.id)}
        >
          {tab.icon}
          {tab.label}
        </button>
      ))}
    </nav>
  );
}
