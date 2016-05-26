var nsIProtocolProxyService = Cc["@mozilla.org/network/protocol-proxy-service;1"].getService(Components.interfaces.nsIProtocolProxyService);

/**
 * @param {Address} address
 * @constructor
 */
function ProxyManager(address) {
    this.address = address;
}

ProxyManager.prototype = {
    /**
     * @returns {Object}
     */
    service: function () {
        var __this = this;

        return {
            applyFilter: function (th, uri, proxy) {
                var __uri = uri.spec;

                if (__this.isTemplateEnabled() && __uri.indexOf(__this.getUriList()) < 0) {
                    return proxy;
                }

                return nsIProtocolProxyService.newProxyInfo(
                    __this.address.getProxyProtocol(),
                    __this.address.getIPAddress(),
                    __this.address.getPort()
                );
            },
            register: function () {
                nsIProtocolProxyService.registerFilter(this, 0);
            },
            unregister: function () {
                nsIProtocolProxyService.unregisterFilter(this);
            }
        };
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