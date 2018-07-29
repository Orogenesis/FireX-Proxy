class Connector {
    /**
     * @param {Address} address
     * @returns {void}
     */
    static connect(address) {
        let configuration = {
            toProxyScript: true
        };

        browser.runtime.sendMessage({
            proxy: `${address.getPacProtocol()} ${address.ipAddress}:${address.port}`
        }, configuration);

        /**
         * Change icon color to green
         */
        browser.browserAction.setIcon({
            path: {
                "16": 'data/icons/icon-16-active.png',
                "24": 'data/icons/icon-24-active.png',
                "32": 'data/icons/icon-32-active.png',
            }
        });
    }

    /**
     * @returns {Promise}
     */
    static disconnect() {
        return new Promise(
            resolve => {
                let configuration = {
                    toProxyScript: true
                };

                browser.runtime.sendMessage({
                    proxy: 'DIRECT'
                }, configuration).then(resolve);

                /**
                 * Change icon color to black
                 */
                browser.browserAction.setIcon({
                    path: {
                        "16": 'data/icons/icon-16.png',
                        "24": 'data/icons/icon-24.png',
                        "32": 'data/icons/icon-32.png',
                    }
                });
            }
        );
    }
}
