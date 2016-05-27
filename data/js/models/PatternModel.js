var FireX = FireX || {};

$(function () {
    FireX.PatternModel = Backbone.Model.extend({
        defaults: {
            iIdentifier: -1,
            iUri: null
        }
    });
});