class Connector {
    /**
     * @param {Address} address
     * @param {Array<String>} blacklist
     * @param {Object} blacklistSettings
     * @returns {void}
     */
    static connect(address, blacklist, blacklistSettings) {
        let proxy = `${address.getPacProtocol()} ${address.ipAddress}:${address.port}`;

        if (browser.proxy.settings) {
            fetch(browser.runtime.getURL('addon/pac/chrome.dat'))
                .then(response => response.text())
                .then(response => {
                    const data = response
                        .replace(/@isBlacklistEnabled@/g, blacklistSettings.isBlacklistEnabled || false)
                        .replace(/@proxy@/g, proxy)
                        .replace(/@blacklist@/g, JSON.stringify(blacklist));

                    browser.proxy.settings.set({
                        value: {
                            mode: "pac_script",
                            pacScript: {
                                data: data
                            }
                        }
                    });
                });
        } else {
            browser.runtime.sendMessage({
                proxy: proxy
            }, {
                toProxyScript: true
            });
        }

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
                if (browser.proxy.settings) {
                    browser.proxy.settings.set({
                        value: {
                            mode: 'system'
                        },
                        scope: 'regular'
                    }, resolve);
                } else {
                    browser.runtime.sendMessage({
                        proxy: 'DIRECT'
                    }, {
                        toProxyScript: true
                    }).then(resolve);
                }

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
