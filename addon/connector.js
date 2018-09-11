import { isChrome } from './helpers.js';
import { TemplateEngine } from "./templateEngine.js";

export class Connector {
    constructor() {
        this.observers = [];
        this.connected = null;
    }

    /**
     * @param {Function} observer
     * @returns {void}
     * @throws {Error}
     */
    addObserver(observer) {
        if (typeof observer !== 'function') {
            throw new Error('Observer must be a function.');
        }

        this.observers.push(observer);
    }

    /**
     * @returns {void}
     */
    broadcast() {
        this.observers
            .forEach(observer => {
                observer(this);
            });
    }

    /**
     * @param {Address} address
     * @param {Array<string>} blacklist
     * @param {boolean} isBlacklistEnabled
     * @returns {void}
     */
    connect(address, blacklist = [], isBlacklistEnabled = false) {
        if (isChrome()) {
            const engine = new TemplateEngine();

            engine
                .setPlaceholders({
                    isBlacklistEnabled: isBlacklistEnabled,
                    proxy: address.getPac(),
                    blacklist: blacklist
                })
                .buildUrl('addon/pac/chrome.dat')
                .then(data => {
                    browser
                        .proxy
                        .settings
                        .set({
                            value: {
                                mode: 'pac_script',
                                pacScript: {
                                    data: data
                                }
                            }
                        });
                });
        } else {
            let message = {
                proxy: address.getPac()
            };

            browser
                .runtime
                .sendMessage(message, {
                    toProxyScript: true
                });
        }

        this.connected = address;
        this.broadcast();
    }

    /**
     * @returns {Promise<any>}
     */
    disconnect() {
        return new Promise(
            resolve => {
                if (isChrome()) {
                    browser
                        .proxy
                        .settings
                        .set({
                            value: {
                                mode: 'system'
                            },
                            scope: 'regular'
                        }, resolve);
                } else {
                    let message = {
                        proxy: 'DIRECT'
                    };

                    browser
                        .runtime
                        .sendMessage(message, {
                            toProxyScript: true
                        }).then(resolve);
                }

                this.connected = null;
                this.broadcast();
            }
        );
    }
}
