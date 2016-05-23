var FireX = FireX || {};

$(function () {
    FireX.MenuEntryModel = Backbone.Model.extend({
        defaults: {
            iText: null,
            iTo: null,
            iIcon: 'list',
        }
    });
});