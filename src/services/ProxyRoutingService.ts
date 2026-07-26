import { browser } from 'wxt/browser';
import { LocalBypassRules } from '../core/constants';
import type { ProxyEndpoint, ProxyProtocol } from '../core/types';

type BrowserProxyScheme = 'http' | 'https' | 'socks4' | 'socks5';

interface ProxySettingsApi {
  proxy?: {
    settings?: {
      set(details: unknown): Promise<void> | void;
    };
  };
  action?: {
    setBadgeText(details: { text: string }): Promise<void> | void;
    setBadgeBackgroundColor(details: { color: string }): Promise<void> | void;
  };
}

const schemeByProtocol: Record<ProxyProtocol, BrowserProxyScheme> = {
  HTTP: 'http',
  HTTPS: 'https',
  SOCKS4: 'socks4',
  SOCKS5: 'socks5'
};

export class ProxyRoutingService {
  private readonly api = browser as unknown as ProxySettingsApi;

  async connect(proxy: ProxyEndpoint, bypassRules: string[] = []): Promise<void> {
    if (!this.api.proxy?.settings) {
      throw new Error('This browser does not expose proxy settings to extensions.');
    }

    await this.api.proxy.settings.set({
      value: this.createBrowserProxyConfig(proxy, bypassRules),
      scope: 'regular'
    });

    await this.updateBadge(proxy);
  }

  async disconnect(): Promise<void> {
    if (this.api.proxy?.settings) {
      await this.api.proxy.settings.set({
        value: navigator.userAgent.includes('Firefox') ? { proxyType: 'system' } : { mode: 'system' },
        scope: 'regular'
      });
    }

    await this.updateBadge();
  }

  async updateBadge(proxy?: ProxyEndpoint): Promise<void> {
    await this.api.action?.setBadgeText({ text: proxy ? 'ON' : '' });
    await this.api.action?.setBadgeBackgroundColor({ color: '#0f766e' });
  }

  private createBrowserProxyConfig(proxy: ProxyEndpoint, bypassRules: string[]): unknown {
    if (navigator.userAgent.includes('Firefox')) {
      return this.createFirefoxProxyConfig(proxy, bypassRules);
    }

    return {
      mode: 'fixed_servers',
      rules: {
        singleProxy: {
          scheme: schemeByProtocol[proxy.protocol],
          host: proxy.host,
          port: proxy.port
        },
        bypassList: this.mergedBypassRules(bypassRules)
      }
    };
  }

  private createFirefoxProxyConfig(proxy: ProxyEndpoint, bypassRules: string[]): unknown {
    const address = `${proxy.host}:${proxy.port}`;
    const passthrough = this.mergedBypassRules(bypassRules).join(', ');

    if (proxy.protocol === 'SOCKS4' || proxy.protocol === 'SOCKS5') {
      return {
        proxyType: 'manual',
        socks: address,
        socksVersion: proxy.protocol === 'SOCKS4' ? 4 : 5,
        proxyDNS: proxy.protocol === 'SOCKS5',
        passthrough
      };
    }

    const scheme = proxy.protocol === 'HTTPS' ? 'https' : 'http';
    const httpProxy = `${scheme}://${address}`;

    return {
      proxyType: 'manual',
      http: httpProxy,
      ssl: httpProxy,
      ftp: httpProxy,
      httpProxyAll: true,
      passthrough
    };
  }

  private mergedBypassRules(rules: string[]): string[] {
    return [...new Set([...LocalBypassRules, ...rules.map(rule => rule.trim()).filter(Boolean)])];
  }
}
