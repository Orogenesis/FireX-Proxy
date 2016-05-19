var FireX = FireX || {};

$(function () {
    FireX.ProxyView = Backbone.View.extend({
        tag: 'tr',
        template: _.template($('#server-template').html()),
        render: function () {
            this.$el.html(this.template(this.model.toJSON()));
        }
    });
});