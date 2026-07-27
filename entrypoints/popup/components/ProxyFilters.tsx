import { Filter, RotateCcw, Search, ShieldCheck, SlidersHorizontal, X, XCircle } from 'lucide-react';
import { useEffect, type ReactNode } from 'react';
import type { EffectiveHealthFilter, HealthFilter, ProtocolFilter } from '../hooks/useProxyFilters';

interface ProxyFiltersProps {
  expanded: boolean;
  hasActiveFilters: boolean;
  healthFilter: EffectiveHealthFilter;
  protocolFilter: ProtocolFilter;
  query: string;
  onClose(): void;
  onHealthFilterChange(value: HealthFilter): void;
  onProtocolFilterChange(value: ProtocolFilter): void;
  onQueryChange(value: string): void;
  onReset(): void;
  onToggle(): void;
}

export function ProxyFilters({
  expanded,
  hasActiveFilters,
  healthFilter,
  protocolFilter,
  query,
  onClose,
  onHealthFilterChange,
  onProtocolFilterChange,
  onQueryChange,
  onReset,
  onToggle
}: ProxyFiltersProps) {
  useEffect(() => {
    if (!expanded) {
      return;
    }

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [expanded, onClose]);

  return (
    <div className={expanded ? 'proxyFilterLayer open' : 'proxyFilterLayer'}>
      <button
        className={hasActiveFilters ? 'proxyFilterToggle active' : 'proxyFilterToggle'}
        type="button"
        title="Filter proxies"
        onClick={onToggle}
      >
        <Filter size={16} />
        {hasActiveFilters && <span />}
      </button>

      {expanded && (
        <div className="proxyFilterPanel">
          <div className="filterPanelTop">
            <div className="filterPanelActions">
              {hasActiveFilters && (
                <button type="button" title="Reset filters" onClick={onReset}>
                  <RotateCcw size={14} />
                </button>
              )}
              <button type="button" title="Close filters" onClick={onClose}>
                <X size={15} />
              </button>
            </div>
          </div>

          <label className="filterSearch">
            <Search size={15} />
            <input
              aria-label="Search proxies"
              placeholder="Search host, port, or name"
              value={query}
              onChange={event => onQueryChange(event.currentTarget.value)}
            />
          </label>

          <FilterRow label="Protocol">
            {protocolOptions.map(option => (
              <button
                key={option.value}
                className={protocolFilter === option.value ? 'filterPill active' : 'filterPill'}
                type="button"
                onClick={() => onProtocolFilterChange(option.value)}
              >
                {option.label}
              </button>
            ))}
          </FilterRow>

          <FilterRow label="Status">
            {healthOptions.map(option => (
              <button
                key={option.value}
                className={healthFilter === option.value ? 'filterPill active' : 'filterPill'}
                type="button"
                onClick={() => onHealthFilterChange(option.value)}
              >
                {option.icon}
                {option.label}
              </button>
            ))}
          </FilterRow>
        </div>
      )}
    </div>
  );
}

interface FilterRowProps {
  children: ReactNode;
  label: string;
}

function FilterRow({ children, label }: FilterRowProps) {
  return (
    <div className="filterOptionRow">
      <span>{label}</span>
      <div>{children}</div>
    </div>
  );
}

const protocolOptions = [
  { value: 'all', label: 'All' },
  { value: 'HTTP', label: 'HTTP' },
  { value: 'HTTPS', label: 'HTTPS' },
  { value: 'socks', label: 'SOCKS' }
] satisfies Array<{ value: ProtocolFilter; label: string }>;

const healthOptions = [
  { value: 'all', label: 'All', icon: <SlidersHorizontal size={13} /> },
  { value: 'working', label: 'Working', icon: <ShieldCheck size={13} /> },
  { value: 'failed', label: 'Failed', icon: <XCircle size={13} /> }
] satisfies Array<{ value: EffectiveHealthFilter; label: string; icon: ReactNode }>;
