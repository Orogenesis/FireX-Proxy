import { isChrome } from "./helpers.js";

export class Connector {
    /**
     * @param {Address} address
     * @param {Array<String>} blacklist
     * @param {Object} blacklistSettings
     * @returns {void}
     */
    static connect(address, blacklist, blacklistSettings) {
        let proxy = `${address.getPacProtocol()} ${address.ipAddress}:${address.port}`;

        if (isChrome()) {
            fetch(browser.runtime.getURL('addon/pac/chrome.dat'))
                .then(response => response.text())
                .then(response => {
                    const data = response
                        .replace(/%isBlacklistEnabled%/g, (blacklistSettings.isBlacklistEnabled || false).toString())
                        .replace(/%proxy%/g, proxy)
                        .replace(/%blacklist%/g, JSON.stringify(blacklist));

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
            let message = {
                proxy: proxy
            };

            browser.runtime.sendMessage(message, {
                toProxyScript: true
            });
        }

        /**
         * Change icon color to green
         */
        browser.browserAction.setIcon({
            path: {
                16: "data/icons/action/icon-16-active.png",
                32: "data/icons/action/icon-32-active.png",
                48: "data/icons/action/icon-48-active.png",
                64: "data/icons/action/icon-64-active.png",
                128: "data/icons/action/icon-128-active.png"
            }
        });
    }

    /**
     * @returns {Promise}
     */
    static disconnect() {
        return new Promise(
            resolve => {
                if (isChrome()) {
                    browser.proxy.settings.set({
                        value: {
                            mode: 'system'
                        },
                        scope: 'regular'
                    }, resolve);
                } else {
                    let message = {
                        proxy: 'DIRECT'
                    };

                    browser.runtime.sendMessage(message, {
                        toProxyScript: true
                    }).then(resolve);
                }

                browser.browserAction.setIcon({
                    path: {
                        16: "data/icons/action/icon-16.png",
                        32: "data/icons/action/icon-32.png",
                        48: "data/icons/action/icon-48.png",
                        64: "data/icons/action/icon-64.png",
                        128: "data/icons/action/icon-128.png"
                    }
                });
            }
        );
    }
}
