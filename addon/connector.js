import { isChrome, isInNet, shExpMatch } from './helpers.js'
import { TemplateEngine } from './templateEngine.js'

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
        this.blacklist = [];
        this.connected = null;
        this.isBlacklistEnabled = false;
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

    /**
     * @param {*} requestInfo
     * @returns {Function}
     */
    handleProxyRequest(requestInfo) {
        if (!shouldProxyRequest(requestInfo, this.blacklist, this.isBlacklistEnabled)) {
            return {
                type: 'DIRECT'
            };
        }

        return [{
            type: this.getConnected().getPacType(),
            host: this.getConnected().getIPAddress(),
            port: this.getConnected().getPort()
        }];
    }

    /**
     * @param {Address} address
     * @param {Array<string>} blacklist
     * @param {boolean} isBlacklistEnabled
     * @returns {void}
     */
    connect(address, blacklist = [], isBlacklistEnabled = false) {
        this.blacklist = blacklist;
        this.isBlacklistEnabled = isBlacklistEnabled;
        this.connected = address;

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
            browser.proxy.onRequest.addListener(this.handleProxyRequest.bind(this), {
                urls: ['<all_urls>']
            });
        }

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
                browser.proxy.onRequest.removeListener(this.handleProxyRequest.bind(this));
                resolve();
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
