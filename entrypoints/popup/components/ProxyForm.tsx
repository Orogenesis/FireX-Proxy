import { FormEvent, useState } from 'react';
import { ChevronDown, Plus } from 'lucide-react';
import { ProxyProtocols } from '../../../src/core/constants';
import type { ProxyDraft, ProxyProtocol } from '../../../src/core/types';

interface ProxyFormProps {
  busy: boolean;
  onSubmit(proxy: ProxyDraft): void;
}

const initialDraft: ProxyDraft = {
  protocol: 'HTTP',
  host: '',
  port: 8080
};

export function ProxyForm({ busy, onSubmit }: ProxyFormProps) {
  const [draft, setDraft] = useState<ProxyDraft>(initialDraft);
  const [expanded, setExpanded] = useState(false);

  const update = <K extends keyof ProxyDraft>(field: K, value: ProxyDraft[K]) => {
    setDraft(current => ({ ...current, [field]: value }));
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    onSubmit(draft);
    setDraft(initialDraft);
    setExpanded(false);
  };

  return (
    <section className={expanded ? 'proxyForm expanded' : 'proxyForm'}>
      <button className="collapseHeader" type="button" onClick={() => setExpanded(current => !current)}>
        <span>
          <Plus size={16} />
          Add proxy
        </span>
        <ChevronDown size={17} />
      </button>

      {expanded && (
        <form className="proxyFormBody" onSubmit={submit}>
          <label>
            Name
            <input value={draft.name || ''} placeholder="Work proxy" onChange={event => update('name', event.target.value)} />
          </label>

          <div className="segmented" role="radiogroup" aria-label="Proxy protocol">
            {ProxyProtocols.map(protocol => (
              <button
                key={protocol}
                type="button"
                className={draft.protocol === protocol ? 'active' : ''}
                onClick={() => update('protocol', protocol as ProxyProtocol)}
              >
                {protocol}
              </button>
            ))}
          </div>

          <div className="formGrid">
            <label>
              Host
              <input required value={draft.host} placeholder="127.0.0.1" onChange={event => update('host', event.target.value)} />
            </label>
            <label>
              Port
              <input
                required
                min={1}
                max={65535}
                type="number"
                value={draft.port}
                onChange={event => update('port', Number(event.target.value))}
              />
            </label>
          </div>

          <button className="primaryButton" disabled={busy} type="submit">
            <Plus size={16} />
            Add proxy
          </button>
        </form>
      )}
    </section>
  );
}
