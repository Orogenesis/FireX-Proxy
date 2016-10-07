const { Cc, Ci } = require('chrome');
const nsIProtocolProxyService = Cc["@mozilla.org/network/protocol-proxy-service;1"].getService(Ci.nsIProtocolProxyService);

/**
 * @param {TemplateManager} tManager
 * @constructor
 */
function Connector(tManager) {
    this.tManager = tManager;

    this.setState(false);
}

Connector.prototype = {
    /**
     * @returns {Object}
     */
    service: function () {
        return (function (that) {
            return {
                applyFilter: function (th, uri, proxy) {
                    if (!that.isEnabled() || (that.tManager.isTemplateEnabled() && that.tManager.allLinks().indexOf(uri.prePath) < 0)) {
                        return proxy;
                    }
                    
                    return nsIProtocolProxyService.newProxyInfo(that.address.getProxyProtocol(), that.address.getIPAddress(), that.address.getPort(), 0, -1, null);
                },
                register: function () {
                    nsIProtocolProxyService.registerFilter(this, 0);
                },
                unregister: function () {
                    nsIProtocolProxyService.unregisterFilter(this);
                }
            };
        })(this);
    },
    /**
     * @param {Address} endpoint
     * @returns {void}
     */
    start: function (endpoint) {
        this.address = endpoint;

        this.service().register();
        this.setState(true);
    },
    /**
     * @returns {void}
     */
    stop: function () {
        this.service().unregister();
        this.setState(false);
    },
    /**
     * @param {Boolean} state
     */
    setState: function (state) {
        this.iEnabled = state;
    },
    /**
     * @returns {Boolean}
     */
    isEnabled: function () {
        return this.iEnabled;
    }
};

exports.Connector = Connector;