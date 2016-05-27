var FireX = FireX || {};

$(function () {
    FireX.ProxyServerModel = Backbone.Model.extend({
        defaults: {
            iAddress:   null,
            iPort:      -1,
            iProtocol:  null,
            iCountry:   null,
            iActive:    false
        },
        toggle: function () {
            this.set({
                iActive: !this.get('iActive')
            });
            
            return this.get('iActive');
        }
    });
});