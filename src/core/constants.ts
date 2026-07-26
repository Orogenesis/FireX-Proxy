export const ProxyProtocols = ['HTTP', 'HTTPS', 'SOCKS4', 'SOCKS5'] as const;

export const DefaultProxySources = [
  'https://raw.githubusercontent.com/Orogenesis/FireX-Proxy/master/proxies.txt'
] as const;

export const LocalBypassRules = [
  '<local>',
  'localhost',
  '127.0.0.1',
  '::1',
  '10.0.0.0/8',
  '172.16.0.0/12',
  '192.168.0.0/16'
] as const;
