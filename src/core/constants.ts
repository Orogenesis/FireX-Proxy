export const ProxyProtocols = ['HTTP', 'HTTPS', 'SOCKS4', 'SOCKS5'] as const;

export const DefaultProxySources = [
  'https://raw.githubusercontent.com/Orogenesis/FireX-Proxy/master/proxies.txt'
] as const;

export const ProxySourceAutoSyncIntervalMs = 6 * 60 * 60 * 1000;

export const NativeCheckerHostName = 'com.firexproxy.checker';

export const NativeCheckerProtocolVersion = 1;

export const NativeCheckerFallbackMinimumVersion = '0.1.1';

export const NativeCheckerFallbackLatestVersion = '0.1.1';

export const NativeCheckerManifestUrl = 'https://raw.githubusercontent.com/Orogenesis/FireX-Proxy/master/checker-manifest.json';

export const NativeCheckerManifestCacheMs = 6 * 60 * 60 * 1000;

export const NativeCheckerReleaseUrl = 'https://github.com/Orogenesis/FireX-Proxy/releases/latest';

export const DefaultProxyCheckerSettings = {
  enabled: true,
  maxWorking: 10,
  maxCandidates: 300,
  concurrency: 15,
  timeoutMs: 7000,
  recheckIntervalMinutes: 60,
  targets: [
    'https://www.gstatic.com/generate_204',
    'http://connectivitycheck.gstatic.com/generate_204'
  ]
} as const;

export const LocalBypassRules = [
  '<local>',
  'localhost',
  '127.0.0.1',
  '::1',
  '10.0.0.0/8',
  '172.16.0.0/12',
  '192.168.0.0/16'
] as const;
