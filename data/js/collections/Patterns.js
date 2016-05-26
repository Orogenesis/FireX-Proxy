var FireX = FireX || {};

$(function () {
    FireX.Patterns = Backbone.Collection.extend({
        model: FireX.PatternModel,
        url: '/patterns'
    });
});