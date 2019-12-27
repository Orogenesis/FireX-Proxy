import { isChrome } from './helpers.js'

export class Extension {
  constructor(id, shortName, icon) {
    this.id = id;
    this.shortName = shortName;
    this.icon = icon;
  }
}

/**
 * Chrome: detect extensions with higher precedence
 *
 * @returns {Promise<Extension[]>}
 */
export function detectConflicts() {
  if (!isChrome()) {
    return Promise.resolve([]);
  }

  return new Promise(resolve => {
    const details = {};
    const onlyProxyExtensions = e => e.enabled && e.permissions.indexOf('proxy') > -1 && e.id !== browser.runtime.id;
    const mapExtension = e => new Extension(e.id, e.shortName, e.icons[0].url);

    browser.proxy.settings.get(details, ({ levelOfControl }) => {
      if (levelOfControl === 'controlled_by_other_extensions') {
        browser.management.getAll().then(extensions => {
          resolve(extensions.filter(onlyProxyExtensions).map(mapExtension));
        });

        return;
      }

      resolve([]);
    });
  });
}
