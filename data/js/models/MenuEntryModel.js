var FireX = FireX || {};

$(function () {
    FireX.MenuEntryModel = Backbone.Model.extend({
        defaults: {
            iText: 'Nowhere',
            iTo: "noWhere"
        }
    });
});