var FireX = FireX || {};

$(function () {
    FireX.MenuEntryModel = Backbone.Model.extend({
        defaults: {
            iTo:        null,
            iIcon:      null,
            iText:      null,
            iActive:    false
        },
        get: function(attr) {
            var value = Backbone.Model.prototype.get.call(this, attr);
            return _.isFunction(value) ? value.call(this) : value;
        },
        toJSON: function() {
            var data = {};
            var json = Backbone.Model.prototype.toJSON.call(this);
            _.each(json, function(value, key) {
                data[key] = this.get(key);
            }, this);
            return data;
        }
    });
});