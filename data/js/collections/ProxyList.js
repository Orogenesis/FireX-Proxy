var FireX = FireX || {};

$(function () {
    FireX.ProxyList = Backbone.Collection.extend({
        model: FireX.ProxyServerModel,
        sync: function (method, model, options) {
            options || (options = {});

            
        }
    });

    FireX.ProxyList = new FireX.ProxyList();
});