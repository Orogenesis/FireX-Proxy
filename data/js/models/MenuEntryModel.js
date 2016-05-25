var FireX = FireX || {};

$(function () {
    FireX.MenuEntryModel = Backbone.Model.extend({
        defaults: {
            iTo: null,
            iIcon: null
        }
    });
});