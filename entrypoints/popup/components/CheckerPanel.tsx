import { type CSSProperties, type ReactNode, useEffect, useId, useState } from 'react';
import { Activity, Clock3, Download, Gauge, Minus, Play, Plus, Search, Square, Timer, Zap } from 'lucide-react';
import { NativeCheckerInstallGuideUrl } from '../../../src/core/constants';
import type { ProxyCheckerSettings, ProxyCheckerSnapshot } from '../../../src/core/types';

interface CheckerStatusPanelProps {
  busy: boolean;
  checker: ProxyCheckerSnapshot;
  proxyCount: number;
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
  proxyCount,
  onStart,
  onStop
}: CheckerStatusPanelProps) {
  const checking = checker.run.status === 'checking';
  const runnable = isCheckerUsable(checker.host.status);
  const progressStyle = checking
    ? ({ '--checker-progress': `${progressPercent(checker)}%` } as CSSProperties)
    : undefined;

  return (
    <section className={`checkerRunWidget ${checker.host.status} ${checking ? 'checking' : ''}`} style={progressStyle}>
      <div className="checkerRunInfo">
        <span className="checkerRunMark" aria-hidden="true">
          <Activity size={15} />
        </span>
        <div>
          <strong>Proxy checker</strong>
          <span>{checkerRunLabel(checker, proxyCount)}</span>
        </div>
      </div>

      <div className="checkerRunAction">
        {checking ? (
          <button className="iconButton danger" disabled={busy} title="Stop check" onClick={onStop}>
            <Square size={16} />
          </button>
        ) : runnable ? (
          <button
            className="iconButton success"
            disabled={busy || proxyCount === 0}
            title="Check proxies"
            onClick={onStart}
          >
            <Play size={16} />
          </button>
        ) : (
          <a
            className="iconButton install"
            href={NativeCheckerInstallGuideUrl}
            target="_blank"
            rel="noreferrer"
            title={checkerInstallTip(checker)}
          >
            <Download size={16} />
          </a>
        )}
      </div>
    </section>
  );
}

function isCheckerUsable(status: ProxyCheckerSnapshot['host']['status']): boolean {
  return status === 'available' || status === 'update_available';
}

function checkerRunLabel(checker: ProxyCheckerSnapshot, proxyCount: number): string {
  if (checker.run.status === 'checking') {
    return 'Checking proxies';
  }

  if (checker.host.status === 'missing') {
    return 'Install FireX Native';
  }

  if (checker.host.status === 'outdated') {
    return 'Update FireX Native';
  }

  if (checker.host.status === 'update_available') {
    return 'Update available';
  }

  if (checker.host.status === 'available' && proxyCount === 0) {
    return 'No proxies loaded';
  }

  if (checker.host.status === 'available') {
    return 'Ready';
  }

  return 'Detecting';
}

function checkerInstallTip(checker: ProxyCheckerSnapshot): string {
  if (checker.host.status === 'outdated') {
    return 'Open the FireX Native installation guide to update it, then restart the browser.';
  }

  return 'Open the FireX Native installation guide. It checks proxies locally; restart the browser after installing.';
}

export function CheckerSettingsPanel({ busy, checker, onSave }: CheckerSettingsPanelProps) {
  const [settings, setSettings] = useState(checker.settings);
  const checking = checker.run.status === 'checking';
  const settingsAvailable = isCheckerUsable(checker.host.status);

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

      {settingsAvailable && (
        <div className="checkerSettings" aria-disabled={busy || checking}>
          <label className="switchRow" title="Let the extension periodically ask FireX Native to refresh proxy health.">
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
      )}
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
  const metrics = checkerMetrics(checker, checkedProxyCount, proxyCount, visibleProxyCount);
  const progressStyle = checker.run.status === 'checking'
    ? ({ '--checker-progress': `${progressPercent(checker)}%` } as CSSProperties)
    : undefined;

  return (
    <div className={`checkerStatusStrip ${checker.host.status} ${checker.run.status === 'checking' ? 'checking' : ''}`} style={progressStyle}>
      <div className="checkerStatusText">
        <span className="checkerState">
          <span className="checkerStateDot" aria-hidden="true" />
          {stateLabel(checker)}
        </span>
        <strong>{hostLabel(checker)}</strong>
        <span>{statusDetail(checker, checkedProxyCount, proxyCount)}</span>
      </div>
      {metrics.length > 0 && (
        <div className="checkerResultSummary">
          {metrics.map(metric => (
            <span key={metric.label}>
              <strong>{metric.value}</strong>
              <small>{metric.label}</small>
            </span>
          ))}
        </div>
      )}
      {needsInstall && (
        <a
          className="checkerDownload"
          href={NativeCheckerInstallGuideUrl}
          target="_blank"
          rel="noreferrer"
        >
          <Download size={15} />
          {checkerActionLabel(checker.host.status)}
        </a>
      )}
    </div>
  );
}

function checkerActionLabel(status: ProxyCheckerSnapshot['host']['status']): string {
  if (status === 'missing') {
    return 'Install';
  }

  return 'Guide';
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
  proxyCount: number
): string {
  if (checker.run.status === 'checking') {
    return `${checker.run.working} of ${checker.settings.maxWorking} working proxies found.`;
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
    return 'Last check complete.';
  }

  if (checker.host.status === 'available') {
    return 'Installed and ready.';
  }

  return 'Status will refresh automatically when the popup opens.';
}

interface CheckerMetric {
  label: string;
  value: string | number;
}

function checkerMetrics(
  checker: ProxyCheckerSnapshot,
  checkedProxyCount: number,
  proxyCount: number,
  visibleProxyCount: number
): CheckerMetric[] {
  if (checker.run.status === 'checking') {
    return [
      { label: 'Checked', value: checker.run.total > 0 ? `${checker.run.checked}/${checker.run.total}` : checker.run.checked },
      { label: 'Working', value: checker.run.working },
      { label: 'Queued', value: checker.run.queued }
    ];
  }

  if (checker.host.status === 'available' && checkedProxyCount > 0) {
    return [
      { label: 'Working', value: visibleProxyCount },
      { label: 'Checked', value: checkedProxyCount }
    ];
  }

  if (checker.host.status === 'available' && proxyCount > 0) {
    return [
      { label: 'Loaded', value: proxyCount },
      { label: 'Target', value: checker.settings.maxWorking }
    ];
  }

  return [];
}

function stateLabel(checker: ProxyCheckerSnapshot): string {
  if (checker.run.status === 'checking') {
    return 'Scanning';
  }

  if (checker.host.status === 'available') {
    return 'Ready';
  }

  if (checker.host.status === 'update_available') {
    return 'Update available';
  }

  if (checker.host.status === 'outdated') {
    return 'Update required';
  }

  if (checker.host.status === 'missing') {
    return 'Not installed';
  }

  return 'Detecting';
}

function hostLabel(checker: ProxyCheckerSnapshot): string {
  if (checker.host.status === 'available') {
    return checker.host.version ? `FireX Native ${checker.host.version}` : 'FireX Native installed';
  }

  if (checker.host.status === 'update_available') {
    return checker.host.latestVersion ? `FireX Native ${checker.host.version} - update ${checker.host.latestVersion}` : 'FireX Native update available';
  }

  if (checker.host.status === 'outdated') {
    return 'FireX Native update required';
  }

  if (checker.host.status === 'missing') {
    return 'FireX Native recommended';
  }

  return 'FireX Native status unknown';
}

function progressPercent(checker: ProxyCheckerSnapshot): number {
  const { checked, total, working } = checker.run;
  const workingTarget = Math.max(1, checker.settings.maxWorking);

  if (working >= workingTarget || (total > 0 && checked >= total)) {
    return 100;
  }

  if (total <= 0 && checked <= 0 && working <= 0) {
    return 0;
  }

  const targetProgress = (working / workingTarget) * 100;
  const scanProgress = total > 0 ? (checked / total) * 100 : 0;
  const progress = Math.max(targetProgress, scanProgress);

  return Math.max(2, Math.min(99, Math.round(progress)));
}
