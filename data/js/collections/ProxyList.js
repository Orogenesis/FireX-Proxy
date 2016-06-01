var FireX = FireX || {};

$(function () {
    FireX.ProxyList = Backbone.Collection.extend({
        model: FireX.ProxyServerModel,
        initialize: function () {
            var that = this;

            addon.port.on("onFavorites",function (pattern) {
                that.onFavorites(pattern);
            });
        },
        sync: function (method, model, options) {
            addon.port.emit("getFavorites");
        },
        onFavorites: function (favorites) {
            FireX.increment = Math.max(_.max(favorites, function (favorite) {
                return favorite.iId;
            }), 0);

            this.add(favorites);
        }
    });

    FireX.ProxyList = new FireX.ProxyList();
});