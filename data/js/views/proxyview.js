var FireX = FireX || {};
FireX.ProxyView = Backbone.View.extend({
    tag: 'tr',
    template: _.template($('#server-template').html()),
    render: function () {
        this.$el.html(this.template(this.model.toJSON()));
        return this;
    }
});