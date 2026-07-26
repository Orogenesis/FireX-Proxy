import { readFileSync } from 'node:fs';
import { defineConfig } from 'wxt';

interface ExtensionIdentity {
  chromium: {
    id: string;
    key: string;
  };
  firefox: {
    id: string;
  };
}

const extensionIdentity = JSON.parse(
  readFileSync(new URL('./config/extension-identity.json', import.meta.url), 'utf8')
) as ExtensionIdentity;

export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  srcDir: '.',
  publicDir: 'public',
  outDir: 'dist',
  manifest: ({ browser }) => {
    const isFirefox = browser === 'firefox';
    const firefoxSettings = isFirefox
      ? {
          browser_specific_settings: {
            gecko: {
              id: extensionIdentity.firefox.id,
              data_collection_permissions: {
                required: ['none']
              },
              strict_min_version: '109.0'
            }
          }
        }
      : {};

    return {
      name: 'FireX Proxy',
      version: '6.0.0',
      description: 'A clean local proxy list for Chrome, Firefox, and Chromium browsers.',
      icons: {
        16: 'data/icons/action/icon-16.png',
        32: 'data/icons/action/icon-32.png',
        48: 'data/icons/action/icon-48.png',
        64: 'data/icons/action/icon-64.png',
        128: 'data/icons/action/icon-128.png'
      },
      action: {
        default_title: 'FireX Proxy',
        default_icon: {
          16: 'data/icons/action/icon-16.png',
          32: 'data/icons/action/icon-32.png',
          48: 'data/icons/action/icon-48.png',
          64: 'data/icons/action/icon-64.png',
          128: 'data/icons/action/icon-128.png'
        },
        default_popup: 'popup.html'
      },
      ...(!isFirefox ? { key: extensionIdentity.chromium.key } : {}),
      permissions: isFirefox
        ? ['alarms', 'nativeMessaging', 'proxy', 'storage', 'https://raw.githubusercontent.com/*']
        : ['alarms', 'nativeMessaging', 'proxy', 'storage'],
      ...(!isFirefox ? { host_permissions: ['https://raw.githubusercontent.com/*'] } : {}),
      ...(!isFirefox ? { optional_host_permissions: ['http://*/*', 'https://*/*'] } : { optional_permissions: ['http://*/*', 'https://*/*'] }),
      ...firefoxSettings
    };
  }
});
