import { ProxyProvider } from './proxyProvider.js';
import { Addresses } from './addresses.js';
import { isChrome, isMajorUpdate } from './helpers.js';
import { Connector } from './connector.js';
import { Address } from './address.js';
import { detectConflicts } from './conflict.js';

(function setup() {
    let proxyListSession  = new Addresses();
    let blacklistSession  = {};
    let blacklistSettings = {};
    let proxyProvider     = new ProxyProvider();

    if (!isChrome() && browser.proxy.register) {
        browser.proxy.register('addon/pac/firefox.js');
    }

    let pacMessageConfiguration = {
        toProxyScript: true
    };

    browser.storage.local.get()
        .then(
            storage => {
                let favorites = (storage.favorites || [])
                    .map(element => Object.assign(new Address(), element));

                proxyListSession = Addresses
                    .create(favorites)
                    .unique()
                    .union(proxyListSession);

                blacklistSession = storage.blacklist || {};
                blacklistSettings = storage.blacklistSettings || {};

                if (!isChrome()) {
                    browser.runtime.sendMessage({
                        blacklist: blacklistSession,
                        isBlacklistEnabled: blacklistSettings.isBlacklistEnabled
                    }, pacMessageConfiguration);
                }
            }
        );

    browser.storage.onChanged.addListener(
        newSettings => {
            if (newSettings.blacklistSettings || newSettings.blacklist) {
                if (!isChrome()) {
                    browser.runtime.sendMessage({
                        blacklist: blacklistSession,
                        isBlacklistEnabled: blacklistSettings.isBlacklistEnabled
                    }, pacMessageConfiguration);
                } else {
                    let proxies = proxyListSession.filterEnabled();

                    if (!proxies.isEmpty()) {
                        Connector.connect(
                            proxies.one(),
                            blacklistSession,
                            blacklistSettings
                        );
                    }
                }
            }
        }
    );

    browser.runtime.onInstalled.addListener(details => {
        const { reason, previousVersion } = details;

        if (reason === 'update') {
            const currentVersion = browser.runtime.getManifest().version;

            if (isMajorUpdate(previousVersion, currentVersion)) {
                browser.tabs.create({
                    url: '../welcome/index.html'
                });
            }
        }
    });

    browser.runtime.onMessage.addListener(
        (request, sender, sendResponse) => {
            switch (request.name) {
            case 'get-conflicts':
                detectConflicts()
                    .then(conflicts => {
                        sendResponse(conflicts);
                    });

                break;
            case 'get-proxies':
                if (!proxyListSession.byExcludeFavorites().isEmpty() && !request.force) {
                    sendResponse(proxyListSession.unique());
                } else {
                    let activeProxies = proxyListSession.filterEnabled();

                    proxyProvider
                        .getProxies()
                        .then(response => {
                            let result = response
                                .map(proxy => {
                                    return (new Address())
                                        .setIPAddress(proxy.server)
                                        .setPort(proxy.port)
                                        .setCountry(proxy.country)
                                        .setProtocol(proxy.protocol)
                                        .setPingTimeMs(proxy.pingTimeMs)
                                        .setIsoCode(proxy.isoCode);
                                });

                            proxyListSession = proxyListSession
                                .byFavorite()
                                .concat(activeProxies)
                                .concat(result);

                            sendResponse(proxyListSession.unique());
                        });
                }

                break;
            case 'connect':
                Connector.connect(
                    proxyListSession
                        .disableAll()
                        .byIpAddress(request.message['ipAddress'])
                        .byPort(request.message['port'])
                        .one()
                        .enable(),
                    blacklistSession,
                    blacklistSettings
                );

                sendResponse(proxyListSession);

                break;
            case 'disconnect':
                Connector
                    .disconnect()
                    .then(
                        () => proxyListSession.disableAll()
                    );

                sendResponse(proxyListSession);

                break;
            case 'toggle-favorite':
                proxyListSession
                    .byIpAddress(request.message['ipAddress'])
                    .byPort(request.message['port'])
                    .one()
                    .toggleFavorite();

                browser.storage.local.set({
                    favorites: [...proxyListSession.byFavorite()]
                });

                sendResponse(proxyListSession);

                break;
            case 'remove-blacklist':
                delete blacklistSession[request.message['address']];

                browser.storage.local.set({
                    blacklist: blacklistSession
                });

                break;
            case 'add-blacklist':
                blacklistSession[request.message['address']] = request.message['isEnabled'];

                browser.storage.local.set({
                    blacklist: blacklistSession
                });

                break;
            case 'get-blacklist':
                sendResponse(blacklistSession);

                break;
            case 'get-blacklist-settings':
                sendResponse(blacklistSettings);

                break;
            case 'change-blacklist-settings':
                blacklistSettings = request.message;

                browser.storage.local.set({
                    blacklistSettings: blacklistSettings
                });

                break;
            }

            return true;
        }
    );
})();
