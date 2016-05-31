var FireX = FireX || {};

$(function () {
    FireX.ProxyServerModel = Backbone.Model.extend({
        defaults: {
            iAddress:   null,
            iPort:      -1,
            iProtocol:  null,
            iCountry:   null,
            iActive:    false,
            iFavorite:  false
        },
        toggle: function () {
            this.set({
                iActive: !this.get('iActive')
            });
            
            return this.get('iActive');
        },
        favorite: function () {
            FireX.FavoriteServers.create({
                iAddress:   this.get('iAddress'),
                iPort:      this.get('iPort'),
                iProtocol:  this.get('iProtocol'),
                iCountry:   this.get('iCountry'),
                iActive:    this.get('iActive'),
                iFavorite:  true
            });

            this.destroy();
            
            FireX.ProxyList.trigger('change');
        }
    });
});