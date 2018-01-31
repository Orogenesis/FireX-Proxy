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
                                FreeProxyList
                                    .getList()
                                    .then(
                                        (response) => {
                                            proxyListSession = proxyListSession
                                                .disableAll()
                                                .byFavorite()
                                                .concat(response);

                                            sendResponse(proxyListSession.unique());
                                        }
                                    );
                            }
                        );
                } else {
                    sendResponse(proxyListSession.unique());
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
        }

        return true;
    }
);