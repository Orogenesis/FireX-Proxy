var FireX = FireX || {};
console.error("proxylistCollection");
FireX.ProxyList = Backbone.Collection.extend({
    model: FireX.ProxyServer,
    localStorage: new Store("proxy-cache")
});

FireX.proxyList = new FireX.ProxyList();