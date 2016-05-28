var FireX = FireX || {};

$(function () {
    FireX.Patterns = Backbone.Collection.extend({
        model: FireX.PatternModel,
        isNew: false,
        initialize: function () {

            var that = this;

            addon.port.on("onPattern",function (pattern) {
                that.onPattern(pattern);
            });
        },
        sync: function(method, model, options) {
            addon.port.emit("getPatterns");
        },
        onPattern: function (pattern) {
            this.reset(pattern);
        }
    });

    FireX.Patterns = new FireX.Patterns();
});