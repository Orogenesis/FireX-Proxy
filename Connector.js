const { Cc, Ci } = require('chrome');
const nsIProtocolProxyService = Cc["@mozilla.org/network/protocol-proxy-service;1"].getService(Ci.nsIProtocolProxyService);

/**
 * @param {Address} address
 * @constructor
 */
function Connector(address) {
    this.address = address;
    this.setState(false);
}

Connector.prototype = {
    /**
     * @returns {{applyFilter, register, unregister}}
     */
    service: function () {
        return (function (that) {
            return {
                applyFilter: function (th, uri, proxy) {
                    var __uri = uri.spec;

                    if (!that.isEnabled() || (that.isTemplateEnabled() && __uri.indexOf(that.getUriList()) < 0)) {
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
     * @returns void
     */
    start: function () {
        this.service().register();
        this.setState(true);
    },
    /**
     * @returns void
     */
    stop: function () {
        this.service().unregister();
        this.setState(false);
    },
    /**
     * @returns {Boolean}
     */
    isTemplateEnabled: function () {
        return this.tEnabled;
    },
    /**
     * @param {Boolean} state
     * @returns void
     */
    setTemplateState: function (state) {
        this.tEnabled = state;
    },
    /**
     * @returns {Array}
     */
    getUriList: function () {
        return this.uriList;
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