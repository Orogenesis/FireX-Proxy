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
            }
        );
    }
}