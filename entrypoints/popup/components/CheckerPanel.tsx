import { type ReactNode, useEffect, useId, useState } from 'react';
import { Activity, Clock3, Download, Gauge, Minus, Play, Plus, Search, Square, Timer, Zap } from 'lucide-react';
import { NativeCheckerReleaseUrl } from '../../../src/core/constants';
import type { ProxyCheckerSettings, ProxyCheckerSnapshot } from '../../../src/core/types';

interface CheckerStatusPanelProps {
  busy: boolean;
  checker: ProxyCheckerSnapshot;
  checkedProxyCount: number;
  proxyCount: number;
  visibleProxyCount: number;
  onStart(): void;
  onStop(): void;
}

interface CheckerSettingsPanelProps {
  busy: boolean;
  checker: ProxyCheckerSnapshot;
  onSave(settings: ProxyCheckerSettings): void;
}

export function CheckerStatusPanel({
  busy,
  checker,
  checkedProxyCount,
  proxyCount,
  visibleProxyCount,
  onStart,
  onStop
}: CheckerStatusPanelProps) {
  const checking = checker.run.status === 'checking';

  return (
    <section className="checkerPanel compact">
      <PanelHeader
        title="Proxy checker"
        actions={(
          <>
            {checking ? (
              <button className="iconButton danger" disabled={busy} title="Stop check" onClick={onStop}>
                <Square size={16} />
              </button>
            ) : (
              <button
                className="iconButton success"
                disabled={busy || !isCheckerUsable(checker.host.status) || proxyCount === 0}
                title="Check proxies"
                onClick={onStart}
              >
                <Play size={16} />
              </button>
            )}
          </>
        )}
      />

      <CheckerStatusStrip
        checker={checker}
        checkedProxyCount={checkedProxyCount}
        proxyCount={proxyCount}
        visibleProxyCount={visibleProxyCount}
      />
      <CheckerProgress checker={checker} />
      {checker.run.message && <small className="checkerMessage">{checker.run.message}</small>}
    </section>
  );
}

function isCheckerUsable(status: ProxyCheckerSnapshot['host']['status']): boolean {
  return status === 'available' || status === 'update_available';
}

export function CheckerSettingsPanel({ busy, checker, onSave }: CheckerSettingsPanelProps) {
  const [settings, setSettings] = useState(checker.settings);
  const checking = checker.run.status === 'checking';

  useEffect(() => {
    setSettings(checker.settings);
  }, [checker.settings]);

  const updateSettings = (updater: (current: ProxyCheckerSettings) => ProxyCheckerSettings) => {
    setSettings(current => {
      const next = updater(current);
      onSave(next);
      return next;
    });
  };

  return (
    <section className="checkerPanel">
      <PanelHeader title="Checker settings" actions={null} />

      <CheckerStatusStrip checker={checker} checkedProxyCount={0} proxyCount={0} visibleProxyCount={0} />

      <div className="checkerSettings" aria-disabled={busy || checking}>
        <label className="switchRow" title="Let the extension periodically ask the native checker to refresh proxy health.">
          <input
            type="checkbox"
            checked={settings.enabled}
            disabled={busy || checking}
            onChange={event => updateSettings(current => ({ ...current, enabled: event.target.checked }))}
          />
          <span />
          <strong>Periodic recheck</strong>
        </label>

        <div className="checkerSettingsList">
          <NumberField
            icon={<Search size={16} />}
            label="Find working proxies"
            min={1}
            max={500}
            value={settings.maxWorking}
            disabled={busy || checking}
            onChange={maxWorking => updateSettings(current => ({ ...current, maxWorking }))}
          />
          <NumberField
            icon={<Gauge size={16} />}
            label="Scan limit"
            min={1}
            max={20000}
            value={settings.maxCandidates}
            disabled={busy || checking}
            onChange={maxCandidates => updateSettings(current => ({ ...current, maxCandidates }))}
          />
          <NumberField
            icon={<Zap size={16} />}
            label="Concurrency"
            min={1}
            max={512}
            value={settings.concurrency}
            disabled={busy || checking}
            onChange={concurrency => updateSettings(current => ({ ...current, concurrency }))}
          />
          <NumberField
            icon={<Timer size={16} />}
            label="Timeout"
            unit="ms"
            min={1000}
            max={30000}
            step={500}
            value={settings.timeoutMs}
            disabled={busy || checking}
            onChange={timeoutMs => updateSettings(current => ({ ...current, timeoutMs }))}
          />
          {settings.enabled && (
            <NumberField
              icon={<Clock3 size={16} />}
              label="Recheck interval"
              unit="min"
              min={5}
              max={1440}
              value={settings.recheckIntervalMinutes}
              disabled={busy || checking}
              onChange={recheckIntervalMinutes => updateSettings(current => ({ ...current, recheckIntervalMinutes }))}
            />
          )}
        </div>
      </div>
    </section>
  );
}

interface PanelHeaderProps {
  title: string;
  actions: ReactNode | null;
}

function PanelHeader({ title, actions }: PanelHeaderProps) {
  return (
    <div className="checkerTop">
      <div className="sectionTitle">
        <Activity size={16} />
        <h2>{title}</h2>
      </div>
      {actions && <div className="checkerActions">{actions}</div>}
    </div>
  );
}

interface CheckerStatusStripProps {
  checker: ProxyCheckerSnapshot;
  checkedProxyCount: number;
  proxyCount: number;
  visibleProxyCount: number;
}

function CheckerStatusStrip({ checker, checkedProxyCount, proxyCount, visibleProxyCount }: CheckerStatusStripProps) {
  const needsInstall = checker.host.status === 'missing' || checker.host.status === 'outdated' || checker.host.status === 'update_available';
  const releaseUrl = checker.host.releaseUrl || NativeCheckerReleaseUrl;

  return (
    <div className={`checkerStatusStrip ${checker.host.status}`}>
      <div>
        <strong>{hostLabel(checker)}</strong>
        <span>{statusDetail(checker, checkedProxyCount, proxyCount, visibleProxyCount)}</span>
      </div>
      {needsInstall && (
        <a
          className="checkerDownload"
          href={releaseUrl}
          target="_blank"
          rel="noreferrer"
          title="Open the latest FireX Proxy release and download the native checker for your operating system."
        >
          <Download size={15} />
          Download
        </a>
      )}
    </div>
  );
}

function CheckerProgress({ checker }: { checker: ProxyCheckerSnapshot }) {
  if (checker.run.status !== 'checking') {
    return null;
  }

  return (
    <div className="checkerProgressBlock">
      <div className="checkProgress">
        <div style={{ width: `${progressPercent(checker)}%` }} />
      </div>
      <div className="checkerCounters">
        <span>{checker.run.checked}/{checker.run.total} checked</span>
        <span>{checker.run.working} working</span>
        <span>{checker.run.queued} queued</span>
      </div>
    </div>
  );
}

interface NumberFieldProps {
  icon: ReactNode;
  label: string;
  unit?: string;
  min: number;
  max: number;
  step?: number;
  value: number;
  disabled?: boolean;
  onChange(value: number): void;
}

function NumberField({ icon, label, unit, min, max, step = 1, value, disabled, onChange }: NumberFieldProps) {
  const labelId = useId();
  const nextValue = (delta: number) => Math.min(max, Math.max(min, value + delta));
  const updateValue = (rawValue: string) => {
    const parsedValue = Number(rawValue);

    if (!Number.isFinite(parsedValue)) {
      return;
    }

    onChange(Math.min(max, Math.max(min, parsedValue)));
  };

  return (
    <div className="checkerField">
      <span className="checkerFieldLabel" id={labelId}>
        <span>{icon}</span>
        <strong>{label}</strong>
      </span>
      <div className="numberControl">
        <button type="button" disabled={disabled || value <= min} title={`Decrease ${label}`} onClick={() => onChange(nextValue(-step))}>
          <Minus size={13} />
        </button>
        <span className={unit ? 'numberInput withUnit' : 'numberInput'}>
          <input
            aria-labelledby={labelId}
            inputMode="numeric"
            pattern="[0-9]*"
            type="text"
            value={value}
            disabled={disabled}
            onChange={event => updateValue(event.currentTarget.value)}
          />
          {unit && <span>{unit}</span>}
        </span>
        <button type="button" disabled={disabled || value >= max} title={`Increase ${label}`} onClick={() => onChange(nextValue(step))}>
          <Plus size={13} />
        </button>
      </div>
    </div>
  );
}

function statusDetail(
  checker: ProxyCheckerSnapshot,
  checkedProxyCount: number,
  proxyCount: number,
  visibleProxyCount: number
): string {
  if (checker.run.status === 'checking') {
    return 'Checking proxies';
  }

  if (checker.host.status === 'missing') {
    return 'Install it to filter dead proxies and show latency.';
  }

  if (checker.host.status === 'outdated') {
    return 'Update it to keep proxy checks compatible.';
  }

  if (checker.host.status === 'update_available') {
    return checker.host.message || 'A newer checker is available. Current version still works.';
  }

  if (checker.host.status === 'available' && proxyCount > 0 && checkedProxyCount === 0) {
    return `${proxyCount} proxies loaded. Run a check to filter dead proxies.`;
  }

  if (checker.host.status === 'available' && checkedProxyCount > 0) {
    return `${visibleProxyCount} working proxies visible from ${checkedProxyCount} checked.`;
  }

  if (checker.host.status === 'available') {
    return 'Installed and ready.';
  }

  return 'Status will refresh automatically when the popup opens.';
}

function hostLabel(checker: ProxyCheckerSnapshot): string {
  if (checker.host.status === 'available') {
    return checker.host.version ? `Checker ${checker.host.version}` : 'Checker installed';
  }

  if (checker.host.status === 'update_available') {
    return checker.host.latestVersion ? `Checker ${checker.host.version} - update ${checker.host.latestVersion}` : 'Checker update available';
  }

  if (checker.host.status === 'outdated') {
    return 'Checker update required';
  }

  if (checker.host.status === 'missing') {
    return 'Native checker recommended';
  }

  return 'Checker status unknown';
}

function progressPercent(checker: ProxyCheckerSnapshot): number {
  if (checker.run.total <= 0) {
    return 0;
  }

  return Math.min(100, Math.round((checker.run.checked / checker.run.total) * 100));
}
