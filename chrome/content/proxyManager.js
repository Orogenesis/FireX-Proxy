function ProxyManager() {
    this.services = {
        proxyService: Cc["@mozilla.org/network/protocol-proxy-service;1"].getService(Components.interfaces.nsIProtocolProxyService)
    };
    this.defaultData = {
        address: '127.0.0.1',
        port: 80,
        type: 'http',
        enabled: false
    };
    this.proxyData = Object.create(this.defaultData);
    this.uriList = [];
    this.templateEnabled = false;
}

ProxyManager.prototype = {
    proxyService: function () {
        var __self = this;

        return {
            applyFilter: function (th, uri, proxy) {
                if (__self.proxyData.enabled) {
                    if (__self.templateEnabled && __self.uriList.length) {
                        for (var i = __self.uriList.length - 1; i >= 0; --i) {
                            if (!__self.uriList[i].length) continue;

                            if (uri.spec.indexOf(__self.uriList[i]) != -1) {
                                return __self.services.proxyService.newProxyInfo(__self.proxyData.type, __self.proxyData.address, __self.proxyData.port, 0, null, null);
                            }
                        }
                    } else {
                        return __self.services.proxyService.newProxyInfo(__self.proxyData.type, __self.proxyData.address, __self.proxyData.port, 0, null, null);
                    }
                }
                return proxy;
            },
            register: function () {
                __self.services.proxyService.registerFilter(this, 0);
            },
            unregister: function () {
                __self.services.proxyService.unregisterFilter(this);
            }
        };
    },
    start: function (address, port, type) {
        this.stop();
        this.proxyData.address = address;
        this.proxyData.port = port;
        this.proxyData.type = this.toValidProtocol(type);
        this.proxyData.enabled = true;
        this.proxyService().register();
    },
    stop: function () {
        this.proxyData = Object.create(this.defaultData);
        this.proxyService().unregister();
    },
    toValidProtocol: function (type) {
        var __protocols = {
            socks: 'socks4/5'
        };

        for (var protocol in __protocols) {
            if (__protocols.hasOwnProperty(protocol)) {
                if (type == __protocols[protocol]) {
                    return protocol;
                }
            }
        }

        return type;
    }
};