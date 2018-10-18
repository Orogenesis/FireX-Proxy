import { ProxyProvider } from './proxyProvider.js';
import { Addresses } from './addresses.js';
import { isChrome, isMajorUpdate, isMinorUpdate } from './helpers.js';
import { Connector } from './connector.js';
import { Address } from './address.js';
import { detectConflicts } from './conflict.js';

(function setup() {
    let proxyListSession  = new Addresses();
    let proxyProvider     = new ProxyProvider();
    let connector         = new Connector();

    let blacklistSession   = [];
    let isBlacklistEnabled = false;
    let appState           = {
        filters: {
            countryFilter: [],
            protocolFilter: [],
            protocols: [],
            favorites: true
        }
    };

    if (!isChrome() && browser.proxy.register) {
        browser.proxy.register('addon/pac/firefox.js');
    }

    connector.disconnect();

    connector
        .addObserver(
            newConnector => {
                const isConnected = newConnector
                    .connected instanceof Address;

                browser
                    .browserAction
                    .setIcon({
                        path: {
                            16: isConnected
                                ? 'data/icons/action/icon-16-active.png'
                                : 'data/icons/action/icon-16.png',
                            32: isConnected
                                ? 'data/icons/action/icon-32-active.png'
                                : 'data/icons/action/icon-32.png',
                            48: isConnected
                                ? 'data/icons/action/icon-48-active.png'
                                : 'data/icons/action/icon-48.png',
                            64: isConnected
                                ? 'data/icons/action/icon-64-active.png'
                                : 'data/icons/action/icon-64.png',
                            128: isConnected
                                ? 'data/icons/action/icon-128-active.png'
                                : 'data/icons/action/icon-128.png',
                        }
                    });
            }
        );

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

                blacklistSession = storage.patterns || [];
                isBlacklistEnabled = storage.isBlacklistEnabled || false;

                if (!isChrome()) {
                    browser.runtime.sendMessage({
                        blacklist: blacklistSession,
                        isBlacklistEnabled: isBlacklistEnabled
                    }, pacMessageConfiguration);
                }
            }
        );

    browser.storage.onChanged.addListener(
        storage => {
            if (storage.isBlacklistEnabled || storage.patterns) {
                isBlacklistEnabled = storage.isBlacklistEnabled ? storage.isBlacklistEnabled.newValue : isBlacklistEnabled;
                blacklistSession = storage.patterns ? storage.patterns.newValue : blacklistSession ;

                if (!isChrome()) {
                    browser.runtime.sendMessage({
                        blacklist: blacklistSession,
                        isBlacklistEnabled: isBlacklistEnabled
                    }, pacMessageConfiguration);
                } else {
                    let proxies = proxyListSession.filterEnabled();

                    if (!proxies.isEmpty()) {
                        connector.connect(proxies.one(), blacklistSession, isBlacklistEnabled);
                    }
                }
            }
        }
    );

    browser.runtime.onInstalled.addListener(details => {
        const { reason, previousVersion } = details;

        if (reason === 'update') {
            const currentVersion = browser.runtime.getManifest().version;

            if (isMajorUpdate(previousVersion, currentVersion) || isMinorUpdate(previousVersion, currentVersion)) {
                browser.tabs.create({
                    url: '../welcome/index.html'
                });
            }
        }
    });

    browser.runtime.onMessage.addListener(
        (request, sender, sendResponse) => {
            const { name, message } = request;

            switch (name) {
                case 'resolve-conflicts': {
                    if (isChrome()) {
                        detectConflicts()
                            .then(conflicts => {
                                conflicts.forEach(extension => {
                                    browser.management.setEnabled(extension.id, false);
                                });
                            });
                    }

                    break;
                }
                case 'get-conflicts': {
                    detectConflicts()
                        .then(conflicts => {
                            sendResponse(conflicts);
                        });

                    break;
                }
                case 'get-proxies': {
                    const { force } = message;

                    if (!proxyListSession.byExcludeFavorites().isEmpty() && !force) {
                        sendResponse(proxyListSession.unique());
                    } else {
                        let favoriteProxies = proxyListSession.byFavorite();

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
                                    .filterEnabled()
                                    .concat(favoriteProxies)
                                    .concat(result);

                                sendResponse(proxyListSession.unique());
                            });
                    }

                    break;
                }
                case 'connect': {
                    const { ipAddress, port } = message;

                    connector.connect(
                        proxyListSession
                            .disableAll()
                            .byIpAddress(ipAddress)
                            .byPort(port)
                            .one()
                            .enable(),
                        blacklistSession,
                        isBlacklistEnabled
                    );

                    break;
                }
                case 'disconnect': {
                    connector.disconnect().then(
                        () => {
                            proxyListSession.disableAll();
                        }
                    );

                    break;
                }
                case 'toggle-favorite': {
                    const { ipAddress, port } = message;
    
                    proxyListSession
                        .byIpAddress(ipAddress)
                        .byPort(port)
                        .one()
                        .toggleFavorite();

                    browser.storage.local.set({
                        favorites: [...proxyListSession.byFavorite()]
                    });

                    break;
                }
                case 'update-state': {
                    appState = Object.assign(appState, message);

                    break;
                }
                case 'poll-state': {
                    sendResponse(appState);

                    break;
                }
            }

            return true;
        }
    );
})();
