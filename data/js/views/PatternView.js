var FireX = FireX || {};

$(function () {
    FireX.PatternView = Backbone.View.extend({
        template: _.template($('#pattern-template').html()),
        render: function () {
            this.$el.html(this.template());

            return this;
        }
    });
});