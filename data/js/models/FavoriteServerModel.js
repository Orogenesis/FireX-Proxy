var FireX = FireX || {};

$(function () {
    FireX.FavoriteServerModel = FireX.ProxyServerModel.extend({
        defaults: _.extend(FireX.ProxyServerModel.defaults,{
            iFavorite:  true
        }),
        initialize: function () {
            this.isPresent = false;
        },
        isNew: function () {
            return !this.isPresent;
        },
        sync: function (method, model, options) {
            options || (options = {});
            
            switch (method) {
                case "create" :
                    this.isPresent = true;
                    addon.port.emit("onNewFavorite", model.toJSON());
                    break;
                case "delete":
                    addon.port.emit("onDeleteFavorite", FireX.FavoriteServers.indexOf(this));
                    break;
                default:
                    break;
            }
        },
        favorite: function () {
            FireX.ProxyList.create({
                iAddress:   this.get('iAddress'),
                iPort:      this.get('iPort'),
                iProtocol:  this.get('iProtocol'),
                iCountry:   this.get('iCountry'),
                iActive:    this.get('iActive'),
                iFavorite:  false
            });
            
            this.destroy();
            
            FireX.FavoriteServers.trigger('change');
        }
    });
});