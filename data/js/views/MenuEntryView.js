var FireX = FireX || {};

$(function () {
    FireX.MenuEntryView = Backbone.View.extend({
        tagName: 'li',
        template: _.template($("#menu-entry-template").html()),
        events: {
            'click': 'choose'
        },
        render: function () {
            this.$el.html(this.template(this.model.toJSON()));

            return this;
        },
        choose: function () {
            this.$el.addClass('active').siblings().removeClass('active');
        }
    });
});