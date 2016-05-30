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
        toggleFavorite: function () {
            this.set({
                iFavorite: !this.get('iFavorite')
            });

            return this.get('iFavorite');
        }
    });
});