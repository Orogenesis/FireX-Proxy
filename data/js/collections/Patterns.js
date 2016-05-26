var FireX = FireX || {};

$(function () {
    FireX.Patterns = Backbone.Collection.extend({
        model: FireX.PatternModel,
        sync: function(method, model, options) {
            console.log(method);
            console.log(model.toJSON());
            console.log(options);
        }
    });
});