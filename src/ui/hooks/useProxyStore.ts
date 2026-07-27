import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { DefaultProxyCheckerSettings, DefaultProxySources } from '../../core/constants';
import type { ExtensionResponse, ProxyCheckerSettings, ProxyDraft, ProxyEndpoint, ProxySnapshot } from '../../core/types';
import { ExtensionClient } from '../extensionClient';
import { ensureSourceHostPermissions } from '../sourcePermissions';

const client = new ExtensionClient();

const emptySnapshot: ProxySnapshot = {
  proxies: [],
  bypassRules: [],
  source: { urls: [] },
  checker: {
    host: { status: 'unknown' },
    settings: { ...DefaultProxyCheckerSettings, targets: [...DefaultProxyCheckerSettings.targets] },
    run: {
      status: 'idle',
      checked: 0,
      total: 0,
      working: 0,
      failed: 0,
      queued: 0
    },
    results: {}
  }
};

export function useProxyStore() {
  const [snapshot, setSnapshot] = useState<ProxySnapshot>(emptySnapshot);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string>();
  const checkerSettingsSaveId = useRef(0);

  const activeProxy = useMemo(
    () => snapshot.proxies.find(proxy => proxy.id === snapshot.activeProxyId),
    [snapshot.activeProxyId, snapshot.proxies]
  );

  const run = useCallback(async (operation: () => Promise<ExtensionResponse>) => {
    setBusy(true);
    setError(undefined);

    try {
      await operation();
      setSnapshot(await client.send<ProxySnapshot>({ type: 'snapshot:get' }));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Operation failed.');
    } finally {
      setBusy(false);
    }
  }, []);

  const addProxy = useCallback((proxy: ProxyDraft) => run(async () => {
    return client.send({ type: 'proxy:add', proxy });
  }), [run]);

  const updateProxy = useCallback((proxy: ProxyEndpoint) => run(async () => {
    return client.send({ type: 'proxy:update', proxy });
  }), [run]);

  const removeProxy = useCallback((proxyId: string) => run(() => client.send({ type: 'proxy:remove', proxyId })), [run]);

  const connectProxy = useCallback((proxy: ProxyEndpoint) => run(async () => {
    return client.send({ type: 'proxy:connect', proxyId: proxy.id });
  }), [run]);

  const disconnectProxy = useCallback(() => run(() => client.send({ type: 'proxy:disconnect' })), [run]);

  const setBypassRules = useCallback((rules: string[]) => run(() => client.send({ type: 'bypass:set', rules })), [run]);

  const setSourceUrls = useCallback((urls: string[]) => run(() => client.send({
    type: 'source:set',
    source: { urls }
  })), [run]);

  const startChecker = useCallback(() => run(() => client.send({ type: 'checker:start' })), [run]);

  const stopChecker = useCallback(() => run(() => client.send({ type: 'checker:stop' })), [run]);

  const setCheckerSettings = useCallback((settings: ProxyCheckerSettings) => {
    const saveId = checkerSettingsSaveId.current + 1;
    checkerSettingsSaveId.current = saveId;
    setError(undefined);
    setSnapshot(current => ({
      ...current,
      checker: {
        ...current.checker,
        settings
      }
    }));

    client.send<ProxySnapshot>({
      type: 'checker:settings',
      settings
    })
      .then(nextSnapshot => {
        if (checkerSettingsSaveId.current === saveId) {
          setSnapshot(nextSnapshot);
        }
      })
      .catch(cause => {
        if (checkerSettingsSaveId.current === saveId) {
          setError(cause instanceof Error ? cause.message : 'Failed to save checker settings.');
        }
      });
  }, []);

  const syncSource = useCallback(() => run(async () => {
    const urls = [...new Set([...DefaultProxySources, ...snapshot.source.urls])];

    setSyncing(true);

    try {
      if (!await ensureSourceHostPermissions(urls)) {
        return;
      }

      return client.send({ type: 'source:sync' });
    } finally {
      setSyncing(false);
    }
  }), [run, snapshot.source.urls]);

  const autoSyncSource = useCallback(async () => {
    setSyncing(true);

    try {
      return await client.send<ProxySnapshot>({ type: 'source:auto-sync' });
    } finally {
      setSyncing(false);
    }
  }, []);

  useEffect(() => {
    const probeCheckerSnapshot = () => {
      client.send<ProxySnapshot>({ type: 'checker:probe' })
        .then(setSnapshot)
        .catch(cause => setError(cause instanceof Error ? cause.message : 'Failed to detect FireX Native.'));
    };

    const initialize = async () => {
      setError(undefined);
      const nextSnapshot = await client.send<ProxySnapshot>({ type: 'snapshot:get' });

      if (nextSnapshot.proxies.length === 0) {
        try {
          const syncedSnapshot = await autoSyncSource();
          setSnapshot(syncedSnapshot);
          probeCheckerSnapshot();
        } catch (cause) {
          setSnapshot(nextSnapshot);
          throw cause;
        }

        return;
      }

      setSnapshot(nextSnapshot);
      probeCheckerSnapshot();
    };

    initialize()
      .catch(cause => setError(cause instanceof Error ? cause.message : 'Failed to load proxies.'))
      .finally(() => setLoading(false));
  }, [autoSyncSource]);

  useEffect(() => {
    if (snapshot.checker.run.status !== 'checking') {
      return;
    }

    const timer = setInterval(() => {
      client.send<ProxySnapshot>({ type: 'snapshot:get' })
        .then(setSnapshot)
        .catch(cause => setError(cause instanceof Error ? cause.message : 'Failed to refresh checker status.'));
    }, 1000);

    return () => clearInterval(timer);
  }, [snapshot.checker.run.status]);

  return {
    activeProxy,
    busy,
    error,
    loading,
    syncing,
    bypassRules: snapshot.bypassRules,
    proxies: snapshot.proxies,
    checker: snapshot.checker,
    source: snapshot.source,
    sourceSync: snapshot.sourceSync,
    activeProxyId: snapshot.activeProxyId,
    addProxy,
    connectProxy,
    disconnectProxy,
    removeProxy,
    setBypassRules,
    setCheckerSettings,
    setSourceUrls,
    startChecker,
    stopChecker,
    syncSource,
    updateProxy
  };
}
