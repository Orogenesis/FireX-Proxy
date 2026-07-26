#!/usr/bin/env node
import { writeFile } from 'node:fs/promises';
import { isIP } from 'node:net';

const outputFile = new URL('../proxies.txt', import.meta.url);

const sources = [
  {
    name: 'TheSpeedX HTTP',
    protocol: 'http',
    url: 'https://raw.githubusercontent.com/TheSpeedX/SOCKS-List/master/http.txt'
  },
  {
    name: 'TheSpeedX SOCKS4',
    protocol: 'socks4',
    url: 'https://raw.githubusercontent.com/TheSpeedX/SOCKS-List/master/socks4.txt'
  },
  {
    name: 'TheSpeedX SOCKS5',
    protocol: 'socks5',
    url: 'https://raw.githubusercontent.com/TheSpeedX/SOCKS-List/master/socks5.txt'
  },
  {
    name: 'Proxifly HTTP',
    protocol: 'http',
    url: 'https://cdn.jsdelivr.net/gh/proxifly/free-proxy-list@main/proxies/protocols/http/data.txt'
  },
  {
    name: 'Proxifly SOCKS4',
    protocol: 'socks4',
    url: 'https://cdn.jsdelivr.net/gh/proxifly/free-proxy-list@main/proxies/protocols/socks4/data.txt'
  },
  {
    name: 'Proxifly SOCKS5',
    protocol: 'socks5',
    url: 'https://cdn.jsdelivr.net/gh/proxifly/free-proxy-list@main/proxies/protocols/socks5/data.txt'
  }
];

const options = parseOptions(process.argv.slice(2));
const fetchedAt = new Date().toISOString();
const proxies = await collectProxies(options.limit);
const content = renderProxyFile(proxies, fetchedAt);

if (options.dryRun) {
  process.stdout.write(content);
} else {
  await writeFile(outputFile, content, 'utf8');
}

console.error(`Collected ${proxies.length} proxies from ${sources.length} feeds.`);

async function collectProxies(limit) {
  const byId = new Map();

  for (const source of sources) {
    const text = await fetchText(source);

    for (const line of text.split(/\r?\n/)) {
      const proxy = parseProxyLine(line, source);

      if (!proxy) {
        continue;
      }

      byId.set(`${proxy.protocol}:${proxy.host}:${proxy.port}`, proxy);

      if (limit && byId.size >= limit) {
        return [...byId.values()];
      }
    }
  }

  return [...byId.values()];
}

async function fetchText(source) {
  const response = await fetch(source.url, {
    headers: {
      'user-agent': 'FireX-Proxy proxy updater'
    }
  });

  if (!response.ok) {
    throw new Error(`${source.name} failed with HTTP ${response.status}`);
  }

  return response.text();
}

function parseProxyLine(line, source) {
  const value = line.trim();

  if (!value || value.startsWith('#')) {
    return null;
  }

  const normalized = value.includes('://') ? value : `${source.protocol}://${value}`;

  try {
    const url = new URL(normalized);
    const host = url.hostname;
    const port = Number(url.port);
    const protocol = url.protocol.replace(':', '').toLowerCase();

    if (!['http', 'https', 'socks4', 'socks5'].includes(protocol)) {
      return null;
    }

    if (!host || isBlockedHost(host) || !Number.isInteger(port) || port < 1 || port > 65535) {
      return null;
    }

    return {
      protocol,
      host,
      port,
      source: source.name
    };
  } catch {
    return null;
  }
}

function isBlockedHost(host) {
  const normalized = host.toLowerCase();

  if (['0.0.0.0', '127.0.0.1', 'localhost', '::', '::1'].includes(normalized)) {
    return true;
  }

  if (isIP(normalized) === 4) {
    const [first = 0, second = 0] = normalized.split('.').map(Number);

    return first === 0 ||
      first === 10 ||
      first === 127 ||
      first === 169 && second === 254 ||
      first === 172 && second >= 16 && second <= 31 ||
      first === 192 && second === 168 ||
      first >= 224;
  }

  if (isIP(normalized) === 6) {
    return normalized.startsWith('fe80:') ||
      normalized.startsWith('fc') ||
      normalized.startsWith('fd');
  }

  return false;
}

function renderProxyFile(proxies, fetchedAt) {
  const lines = [
    '# FireX Proxy source file',
    '#',
    `# Generated at: ${fetchedAt}`,
    '#',
    '# Format:',
    '#   protocol://host:port # optional display name',
    '#',
    '# Supported protocols:',
    '#   http, https, socks4, socks5',
    '#',
    '# Blank lines and comments are ignored.',
    ''
  ];

  for (const proxy of proxies.sort(compareProxy)) {
    lines.push(`${proxy.protocol}://${proxy.host}:${proxy.port} # ${proxy.source}`);
  }

  lines.push('');
  return lines.join('\n');
}

function compareProxy(a, b) {
  return a.protocol.localeCompare(b.protocol) ||
    a.host.localeCompare(b.host, undefined, { numeric: true }) ||
    a.port - b.port;
}

function parseOptions(args) {
  const options = {
    dryRun: false,
    limit: Number(process.env.PROXY_SOURCE_LIMIT || 0)
  };

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];

    if (arg === '--dry-run') {
      options.dryRun = true;
      continue;
    }

    if (arg === '--limit') {
      options.limit = Number(args[index + 1] || 0);
      index += 1;
      continue;
    }

    throw new Error(`Unknown option: ${arg}`);
  }

  return options;
}
