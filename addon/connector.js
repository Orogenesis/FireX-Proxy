browser.proxy.register('addon/pac.js');

class Connector {
    /**
     * @param {Address} address
     * @returns {void}
     */
    static connect(address) {
        browser.runtime.sendMessage({
            name:  'register',
            proxy: `HTTP ${address.ipAddress}:${address.port}`
        }, {
            toProxyScript: true
        });

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
                browser.runtime.sendMessage({
                    name: 'register',
                    proxy: 'DIRECT'
                }, {
                    toProxyScript: true
                }).then(resolve);

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