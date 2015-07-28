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
        var self = this;
        return {
            applyFilter: function (th, uri, proxy) {
                if (self.proxyData.enabled) {
                    if (self.templateEnabled && self.uriList.length) {
                        for (var i = self.uriList.length - 1; i >= 0; --i) {
                            if (uri.spec.indexOf(self.uriList[i]) != -1) {
                                return self.services.proxyService.newProxyInfo('http', self.proxyData.address, self.proxyData.port, 0, null, null);
                            }
                        }
                    } else {
                        return self.services.proxyService.newProxyInfo('http', self.proxyData.address, self.proxyData.port, 0, null, null);
                    }
                }
                return proxy;
            },
            register: function () {
                self.services.proxyService.registerFilter(this, 0);
            },
            unregister: function () {
                self.services.proxyService.unregisterFilter(this);
            }
        };
    },
    start: function (address, port, type) {
        this.stop();
        this.proxyData.address = address;
        this.proxyData.port = port;
        this.proxyData.type = type;
        this.proxyData.enabled = true;
        this.proxyService().register();
    },
    stop: function () {
        this.proxyData = Object.create(this.defaultData);
        this.proxyService().unregister();
    }
};