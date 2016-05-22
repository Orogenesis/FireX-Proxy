var FireX = FireX || {};

$(function () {
    FireX.Menu = Backbone.Collection.extend({
        model: FireX.MenuEntryModel,
        url: '/menu'
    });
});