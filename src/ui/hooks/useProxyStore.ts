import { useCallback, useEffect, useMemo, useState } from 'react';
import { DefaultProxySources } from '../../core/constants';
import type { ExtensionResponse, ProxyDraft, ProxyEndpoint, ProxySnapshot } from '../../core/types';
import { ExtensionClient } from '../extensionClient';
import { ensureSourceHostPermissions, hasSourceHostPermissions } from '../sourcePermissions';

const client = new ExtensionClient();

const emptySnapshot: ProxySnapshot = {
  proxies: [],
  bypassRules: [],
  source: { urls: [] }
};

export function useProxyStore() {
  const [snapshot, setSnapshot] = useState<ProxySnapshot>(emptySnapshot);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string>();

  const activeProxy = useMemo(
    () => snapshot.proxies.find(proxy => proxy.id === snapshot.activeProxyId),
    [snapshot.activeProxyId, snapshot.proxies]
  );

  const refresh = useCallback(async () => {
    setError(undefined);
    setSnapshot(await client.send<ProxySnapshot>({ type: 'snapshot:get' }));
  }, []);

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

  const autoSyncSource = useCallback(async (snapshotToSync: ProxySnapshot) => {
    const urls = [...new Set([...DefaultProxySources, ...snapshotToSync.source.urls])];

    if (!await hasSourceHostPermissions(urls)) {
      return snapshotToSync;
    }

    setSyncing(true);

    try {
      return await client.send<ProxySnapshot>({ type: 'source:sync' });
    } finally {
      setSyncing(false);
    }
  }, []);

  useEffect(() => {
    const initialize = async () => {
      setError(undefined);
      const nextSnapshot = await client.send<ProxySnapshot>({ type: 'snapshot:get' });

      if (nextSnapshot.proxies.length === 0) {
        setSnapshot(await autoSyncSource(nextSnapshot));
        return;
      }

      setSnapshot(nextSnapshot);
    };

    initialize()
      .catch(cause => setError(cause instanceof Error ? cause.message : 'Failed to load proxies.'))
      .finally(() => setLoading(false));
  }, [autoSyncSource]);

  return {
    activeProxy,
    busy,
    error,
    loading,
    syncing,
    bypassRules: snapshot.bypassRules,
    proxies: snapshot.proxies,
    source: snapshot.source,
    sourceSync: snapshot.sourceSync,
    activeProxyId: snapshot.activeProxyId,
    addProxy,
    connectProxy,
    disconnectProxy,
    refresh,
    removeProxy,
    setBypassRules,
    setSourceUrls,
    syncSource,
    updateProxy
  };
}
