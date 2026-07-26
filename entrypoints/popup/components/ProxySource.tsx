import { FormEvent, useMemo, useState } from 'react';
import { DownloadCloud, Link, Plus, Trash2 } from 'lucide-react';
import { DefaultProxySources } from '../../../src/core/constants';
import type { ProxySourceSettings, ProxySourceSync } from '../../../src/core/types';

interface ProxySourceProps {
  busy: boolean;
  syncing: boolean;
  source: ProxySourceSettings;
  sourceSync?: ProxySourceSync;
  onSave(urls: string[]): void;
  onSync(): void;
}

export function ProxySource({ busy, syncing, source, sourceSync, onSave, onSync }: ProxySourceProps) {
  const [draft, setDraft] = useState('');
  const defaultSources = useMemo(() => new Set<string>(DefaultProxySources), []);
  const sources = useMemo(() => [...new Set([...DefaultProxySources, ...source.urls])], [source.urls]);
  const customSources = sources.filter(url => !defaultSources.has(url));

  const addSource = (event: FormEvent) => {
    event.preventDefault();

    const url = draft.trim();
    if (!url) {
      return;
    }

    onSave([...customSources, url]);
    setDraft('');
  };

  const removeSource = (url: string) => {
    onSave(customSources.filter(sourceUrl => sourceUrl !== url));
  };

  return (
    <section className="sourcePanel">
      <div className="sectionTitle">
        <Link size={16} />
        <h2>Proxy sources</h2>
      </div>

      <form className="inlineEditor" onSubmit={addSource}>
        <input
          value={draft}
          spellCheck={false}
          placeholder="https://raw.githubusercontent.com/user/repo/main/proxies.txt"
          onChange={event => setDraft(event.target.value)}
        />
        <button className="iconButton" disabled={busy || !draft.trim()} title="Add source" type="submit">
          <Plus size={17} />
        </button>
      </form>

      <div className="sourceList">
        {sources.map(url => (
          <SourceRow
            key={url}
            busy={busy}
            defaultSource={defaultSources.has(url)}
            result={sourceSync?.sources.find(item => item.url === url)}
            url={url}
            onRemove={removeSource}
          />
        ))}
      </div>

      <button className="secondaryButton" disabled={busy || syncing || sources.length === 0} onClick={onSync}>
        {syncing ? <span className="spinner small" /> : <DownloadCloud size={16} />}
        {syncing ? 'Syncing' : 'Sync all'}
      </button>

      <SourceStatus sourceSync={sourceSync} />
    </section>
  );
}

function SourceRow(props: {
  busy: boolean;
  defaultSource: boolean;
  result?: { imported: number; bytes: number };
  url: string;
  onRemove(url: string): void;
}) {
  return (
    <div className="sourceRow">
      <div>
        <span>{props.url}</span>
        <small>
          {props.defaultSource ? 'Default source' : 'Custom source'}
          {props.result ? ` - ${props.result.imported} imported, ${props.result.bytes} bytes` : ''}
        </small>
      </div>
      <button
        className="iconButton ghost"
        disabled={props.busy || props.defaultSource}
        title={props.defaultSource ? 'Default source cannot be removed' : 'Remove source'}
        onClick={() => props.onRemove(props.url)}
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
}

function SourceStatus({ sourceSync }: { sourceSync?: ProxySourceSync }) {
  if (!sourceSync) {
    return <div className="sourceStatus">No sync has run yet.</div>;
  }

  return (
    <div className="sourceStatus">
      <span>Last sync: {new Date(sourceSync.syncedAt).toLocaleString()}</span>
      <span>{sourceSync.bytes} bytes fetched</span>
      <span>{sourceSync.imported} proxies imported</span>
    </div>
  );
}
