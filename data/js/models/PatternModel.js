var FireX = FireX || {};

$(function () {
    FireX.PatternModel = Backbone.Model.extend({
        sync: function(method, model, options) {
            console.log(method);
            console.log(model.toJSON());
            console.log(options);
        }
    });
});