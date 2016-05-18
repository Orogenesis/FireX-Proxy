var FireX = FireX || {};

FireX.ProxyList = Backbone.Collection.extend({
    model: FireX.ProxyServer,
    localStorage: new Store("proxy-cache")
});

FireX.proxyList = new FireX.ProxyList();