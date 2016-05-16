var { Cc, Ci } = require('chrome');
var nsIProtocolProxyService = Cc["@mozilla.org/network/protocol-proxy-service;1"].getService(Ci.nsIProtocolProxyService);

/**
 * @param {Address} address
 * @constructor
 */
function Connector(address) {
    this.address = address;
}

Connector.prototype = {
    /**
     * @returns {{applyFilter, register, unregister}}
     */
    service: function () {
        return (function (self) {
            return {
                applyFilter: function (th, uri, proxy) {
                    var __uri = uri.spec;

                    if (self.isTemplateEnabled() && __uri.indexOf(self.getUriList()) < 0) {
                        return proxy;
                    }

                    return nsIProtocolProxyService.newProxyInfo(self.address.getProxyProtocol(), self.address.getIPAddress(), self.address.getPort(), 0, -1, null);
                }
                ,
                register: function () {
                    nsIProtocolProxyService.registerFilter(this, 0);
                }
                ,
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
    },
    /**
     * @returns void
     */
    stop: function () {
        this.service().unregister();
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
    }
};

exports.Connector = Connector;