var FireX = FireX || {};

$(function () {
    FireX.PatternModel = Backbone.Model.extend({
        defaults: {
            iUri: null
        },
        isNew: function() {
            return !this.isPresent;
        },
        initialize() {
            this.isPresent = false;
        },
        sync: function (method, model, options) {
            options = options || {};
            
            switch (method) {
                case "create":
                    this.isPresent = true;
                    addon.port.emit("addPattern", model.toJSON());
                    break;
                case "delete":
                    addon.port.emit("deletePattern", FireX.Patterns.indexOf(this));
                    break;
                case "update":
                    addon.port.emit("updatePattern", FireX.Patterns.indexOf(this), model.toJSON());
                    break;
                default:
                    break;
            }
        }
    });
});