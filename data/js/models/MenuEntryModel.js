var FireX = FireX || {};

$(function () {
    FireX.MenuEntryModel = Backbone.Model.extend({
        defaults: {
            iName: 'Nowhere',
            iTo: "noWhere"
        }
    });
});