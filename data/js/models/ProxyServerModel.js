var FireX = FireX || {};

$(function () {
    FireX.ProxyServerModel = Backbone.Model.extend({
        defaults: {
            ipAddress:          null,
            originalProtocol:   null,
            country:            null,
            iActive:            false,
            iFavorite:          false,
            port:               -1
        },
        initialize: function () {
            this.isPresent = false;
        },
        isNew: function () {
            return !this.isPresent;
        },
        sync: function (method, model, options) {
            options || (options = {});
            
            switch (method) {
                case "create":
                    this.isPresent = true;
                    addon.port.emit("onNewFavorite", model.toJSON());
                    break;
                case "update":
                    this.isPresent = false;
                    addon.port.emit("onDeleteFavorite", this.get('iId'));
                    break;
                default:
                    break;
            }
        },
        toggle: function () {
            this.set({
                iActive: !this.get('iActive')
            });
            
            return this.get('iActive');
        },
        favorite: function () {
            if (this.get('iFavorite')) {
                this.save({
                    iFavorite: false
                });
            } else {
                this.save({
                    iId: ++FireX.increment,
                    iFavorite: true
                });
            }
        }
    });
});