var FireX = FireX || {};

$(function () {
    FireX.FavoriteServers = Backbone.Collection.extend({
        model: FireX.FavoriteServerModel,
        initialize: function () {
            var that = this;

            addon.port.on("onFavorites",function (pattern) {
                that.onFavorites(pattern);
            });
        },
        sync: function (method, model, options) {
            addon.port.emit("getFavorites");
        },
        onFavorites: function (pattern) {
            this.reset(pattern);
        }
    });

    FireX.FavoriteServers = new FireX.FavoriteServers();
});