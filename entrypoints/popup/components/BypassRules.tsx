import { KeyboardEvent, useMemo, useState } from 'react';
import { Globe, Plus, Trash2 } from 'lucide-react';

interface BypassRulesProps {
  busy: boolean;
  rules: string[];
  onChange(rules: string[]): void;
}

export function BypassRules({ busy, rules, onChange }: BypassRulesProps) {
  const [draft, setDraft] = useState('');
  const sortedRules = useMemo(() => [...rules].sort((a, b) => a.localeCompare(b)), [rules]);

  const addRule = () => {
    const rule = draft.trim();
    if (!rule) {
      return;
    }

    onChange([rule, ...rules.filter(item => item !== rule)]);
    setDraft('');
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      addRule();
    }
  };

  return (
    <section className="bypassPanel">
      <div className="sectionTitle">
        <Globe size={16} />
        <h2>Bypass rules</h2>
      </div>

      <div className="inlineEditor">
        <input
          value={draft}
          placeholder="example.com, *.internal.test, 192.168.1.0/24"
          onChange={event => setDraft(event.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button className="iconButton" disabled={busy || !draft.trim()} title="Add bypass rule" onClick={addRule}>
          <Plus size={17} />
        </button>
      </div>

      {sortedRules.length > 0 && (
        <div className="ruleList">
          {sortedRules.map(rule => (
            <div className="ruleRow" key={rule}>
              <span>{rule}</span>
              <button
                className="iconButton ghost"
                disabled={busy}
                title="Remove bypass rule"
                onClick={() => onChange(rules.filter(item => item !== rule))}
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
