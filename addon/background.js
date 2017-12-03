let
    proxyListSession = new Addresses(),
    proxyListLocal   = new Addresses()
;

/**
 * Local storage data
 */
browser.storage.local.get()
    .then(
        (storage) => {
            proxyListLocal = new Addresses(
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
                        if (proxyListSession.isEmpty() || message.force) {
                            /**
                             * Disconnect current proxy
                             */
                            await Connector.disconnect();

                            /**
                             * Get proxy list
                             */
                            proxyListSession = await FreeProxyList.getList();
                        }

                        port.postMessage(proxyListSession.concat(proxyListLocal));

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
                let ipAddress = request.message['ipAddress'];

                if (proxyListLocal.byIpAddress(ipAddress).isEmpty()) {
                    proxyListLocal.insert(
                        proxyListSession
                            .byIpAddress(ipAddress)
                            .clone()
                    );
                }

                proxyListLocal
                    .byIpAddress(ipAddress)
                    .one()
                    .toggleFavorite();

                proxyListLocal = proxyListLocal
                    .byFavorite();

                /**
                 * Store favorites
                 */
                browser.storage.local.set({
                    favorites: [...proxyListLocal]
                });

                break;
        }
    }
);