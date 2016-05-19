var FireX = FireX || {};

$(function () {
    FireX.ProxyList = Backbone.Collection.extend({
        model: FireX.ProxyServerModel,
        url: '/proxylist'
    });

    FireX.proxyList = new FireX.ProxyList();
});