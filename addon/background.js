let proxyListSession  = new Addresses();
let blacklistSession  = {};
let blacklistSettings = {};

let proxyProvider = new ProxyProvider();
browser.proxy.register('addon/pac.js');

let pacMessageConfiguration = {
    toProxyScript: true
};

/**
 * Local storage data
 */
browser.storage.local.get()
    .then(
        storage => {
            proxyListSession = proxyListSession.concat(
                ...(storage.favorites || [])
                    .map(element => Object.assign(new Address(), element))
            );

            blacklistSession = storage.blacklist || {};

            blacklistSettings = storage.blacklistSettings || {};

            browser.runtime.sendMessage({
                blacklist          : blacklistSession,
                isBlacklistEnabled : blacklistSettings.isBlacklistEnabled
            }, pacMessageConfiguration)
        }
    );

browser.storage.onChanged.addListener(
    newSettings => {
        if (newSettings.blacklistSettings || newSettings.blacklist) {
            browser.runtime.sendMessage({
                blacklist          : blacklistSession,
                isBlacklistEnabled : blacklistSettings.isBlacklistEnabled
            }, pacMessageConfiguration)
        }
    }
);

browser.runtime.onInstalled.addListener(
    details => {
        const { reason, previousVersion } = details;

        switch (reason) {
            case 'update':
                if (versionCompare(previousVersion, browser.runtime.getManifest().version) === -1) {
                    browser.tabs.create({
                        url: '../welcome/index.html'
                    });
                }

                break;
        }
    }
);

browser.runtime.onMessage.addListener(
    (request, sender, sendResponse) => {
        switch (request.name) {
            /**
             * Get proxy list
             */
            case 'get-proxy-list':
                if (proxyListSession.byExcludeFavorites().isEmpty() || request.force) {
                    /**
                     * Disconnect current proxy
                     */
                    Connector
                        .disconnect()
                        .then(
                            () => {
                                proxyProvider.getProxies().then((response) => {
                                    let result = response
                                        .map(proxy => {
                                            return (new Address())
                                                .setIPAddress(proxy.server)
                                                .setPort(proxy.port)
                                                .setCountry(proxy.country)
                                                .setProtocol(proxy.protocol)
                                                .setPingTimeMs(proxy.pingTimeMs);
                                        });

                                    proxyListSession = proxyListSession
                                        .disableAll()
                                        .byFavorite()
                                        .concat(result);

                                    sendResponse(proxyListSession.unique());
                                });
                            }
                        );
                }
                break;
            /**
             * Proxy connect
             */
            case 'connect':
                Connector.connect(
                    proxyListSession
                        .disableAll()
                        .byIpAddress(request.message['ipAddress'])
                        .one()
                        .enable()
                );

                sendResponse(proxyListSession);

                break;
            /**
             * Proxy disconnect
             */
            case 'disconnect':
                Connector
                    .disconnect()
                    .then(
                        () => proxyListSession.disableAll()
                    );

                sendResponse(proxyListSession);

                break;
            /**
             * Toggle favorite state
             */
            case 'toggle-favorite':
                proxyListSession
                    .byIpAddress(request.message['ipAddress'])
                    .one()
                    .toggleFavorite();

                /**
                 * Store favorites
                 */
                browser.storage.local.set({
                    favorites: [...proxyListSession.byFavorite()]
                });

                sendResponse(proxyListSession);

                break;
            /**
             * Remove an element from blacklist
             */
            case 'remove-blacklist':
                delete blacklistSession[request.message['address']];

                browser.storage.local.set({
                    blacklist: blacklistSession
                });

                break;
            /**
             * Add an element to blacklist
             */
            case 'add-blacklist':
                blacklistSession[request.message['address']] = request.message['isEnabled'];

                browser.storage.local.set({
                    blacklist: blacklistSession
                });

                break;
            /**
             * Read blacklist
             */
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
