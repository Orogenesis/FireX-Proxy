import { isChrome } from './helpers.js'
import { TemplateEngine } from './templateEngine.js'
import { isInNet, shExpMatch } from './helpers'

function shouldProxyRequest(requestInfo, blacklist, isBlacklistEnabled) {
    function isProtocolSupported(protocol) {
        return protocol === 'http:' ||
            protocol === 'https:' ||
            protocol === 'ftp:' ||
            protocol === 'wss:' ||
            protocol === 'ws:';
    }

    function isLocal(hostname) {
        if (hostname === 'localhost' ||
            shExpMatch(hostname, 'localhost.*') ||
            shExpMatch(hostname, '*.local') ||
            hostname === '127.0.0.1') {
            return true;
        }

        if (shExpMatch(hostname, '*.firexproxy.com') ||
            shExpMatch(hostname, 'firexproxy.com')) {
            return true;
        }

        if (isInNet(hostname, '10.0.0.0', '255.0.0.0') || isInNet(hostname, '192.168.0.0', '255.255.0.0')) {
            return true;
        }

        return false;
    }

    function isBlacklisted(hostname) {
        for (let pattern in blacklist) {
            if (!blacklist.hasOwnProperty(pattern)) {
                continue;
            }

            if (shExpMatch(hostname, blacklist[pattern])) {
                return true;
            }
        }

        return false;
    }

    const { url } = requestInfo;
    const { hostname, protocol } = new URL(url);

    if (!isProtocolSupported(protocol)) {
        return false;
    }

    if (isLocal(hostname)) {
        return false;
    }

    if (!isBlacklistEnabled) {
        return true;
    }

    return isBlacklisted(hostname);
}

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
        this.observers.forEach(observer => observer(this));
    }

    handleProxyRequest(blacklist = [], isBlacklistEnabled = false) {
        const connectedProxy = this.getConnected();

        return function (requestInfo) {
            if (!shouldProxyRequest(requestInfo, blacklist, isBlacklistEnabled)) {
                return {
                    type: 'DIRECT'
                };
            }

            return [{
                type: connectedProxy.getPacType(),
                host: connectedProxy.getIPAddress(),
                port: connectedProxy.getPort()
            }];
        };
    }

    /**
     * @param {Address} address
     * @param {Array<string>} blacklist
     * @param {boolean} isBlacklistEnabled
     * @returns {void}
     */
    connect(address, blacklist = [], isBlacklistEnabled = false) {
        if (isChrome()) {
            new TemplateEngine()
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
            browser.proxy.onRequest.addListener(this.handleProxyRequest(isBlacklistEnabled, blacklist), {
                urls: ['<all_urls>']
            });
        }

        this.connected = address;
        this.broadcast();
    }

    /**
     * @returns {Promise<any>}
     */
    disconnect() {
        return new Promise(resolve => {
            if (isChrome()) {
                const message = { value: { mode: 'system' }, scope: 'regular' };
                browser.proxy.settings.set(message, resolve);
            } else {
                browser.proxy.onRequest.removeListener(this.handleProxyRequest());
            }

            this.connected = null;
            this.broadcast();
        });
    }

    /**
     * @returns {Address}
     */
    getConnected() {
        return this.connected;
    }
}
