let proxyListSession = new Addresses();

/**
 * Local storage data
 */
browser.storage.local.get()
    .then(
        (storage) => {
            proxyListSession = proxyListSession.concat(
                ...(storage.favorites || [])
                    .map(element => Object.assign(new Address(), element))
            );
        }
    );

/**
 * Message queue
 */
browser.runtime.onConnect.addListener(
    port => {
        port.onMessage.addListener(
            async message => {
                switch (message.name) {
                    /**
                     * Get proxy list
                     */
                    case 'get-proxy-list':
                        if (proxyListSession.byExcludeFavorites().isEmpty() || message.force) {
                            /**
                             * Disconnect current proxy
                             */
                            await Connector.disconnect();

                            /**
                             * Get proxy list
                             */
                            proxyListSession = proxyListSession
                                .disableAll()
                                .byFavorite()
                                .concat(
                                    await FreeProxyList.getList()
                                );
                        }

                        port.postMessage(proxyListSession.unique());

                        break;
                }
            }
        )
    }
);

browser.runtime.onMessage.addListener(
    async request => {
        switch (request.name) {
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

                break;
            /**
             * Proxy disconnect
             */
            case 'disconnect':
                await Connector.disconnect();

                proxyListSession.disableAll();

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

                break;
        }
    }
);