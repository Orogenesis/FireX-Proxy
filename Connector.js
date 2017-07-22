const { Cc, Ci }              = require('chrome');
const nsIProtocolProxyService = Cc["@mozilla.org/network/protocol-proxy-service;1"].getService(Ci.nsIProtocolProxyService);

class Connector {
    /**
     * @param {TemplateManager} templateManager
     */
    constructor(templateManager) {
        this.templateManager  = templateManager;
        this.connectorEnabled = false;
        this.address          = null;
    }

    /**
     * @returns {Object}
     */
    service() {
        return {
            applyFilter: (th, uri, proxy) => {
                if (!this.isEnabled()) {
                    return proxy;
                }

                if (this.isTemplateNotMatch(uri.prePath)) {
                    return proxy;
                }

                return nsIProtocolProxyService.newProxyInfo(this.address.getProxyProtocol(), this.address.getIPAddress(), this.address.getPort(), 0, -1, null);
            },
            register: function () {
                nsIProtocolProxyService.registerFilter(this, 0);
            },
            unregister: function () {
                nsIProtocolProxyService.unregisterFilter(this);
            }
        };
    }

    /**
     * @param {Address} endpoint
     * @returns {Connector}
     */
    start(endpoint) {
        this.address = endpoint;

        this.service().register();
        this.setState(true);

        return this;
    }

    /**
     * @returns {Connector}
     */
    stop() {
        this.service().unregister();
        this.setState(false);

        return this;
    }

    /**
     * @param {boolean} state
     * @returns {Connector}
     */
    setState(state) {
        this.connectorEnabled = state;

        return this;
    }

    /**
     * @returns {boolean}
     */
    isEnabled() {
        return this.connectorEnabled;
    }

    /**
     * @param {String} uri
     * @returns {boolean}
     */
    isTemplateNotMatch(uri) {
        return this.templateManager.isTemplateEnabled() && this.templateManager.allLinks().indexOf(uri) === -1;
    }
}

exports.Connector = Connector;