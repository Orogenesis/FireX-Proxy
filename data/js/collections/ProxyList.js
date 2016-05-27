var FireX = FireX || {};

$(function () {
    FireX.ProxyList = Backbone.Collection.extend({
        model: FireX.ProxyServerModel,
        url: '/proxylist'
    });

    FireX.ProxyList = new FireX.ProxyList();
});