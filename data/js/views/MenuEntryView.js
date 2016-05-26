var FireX = FireX || {};

$(function () {
    FireX.MenuEntryView = Backbone.View.extend({
        tagName: 'a',
        template: _.template($("#menu-entry-template").html()),
        events: {
            'click': 'choose'
        },
        render: function () {
            this.$el.attr("href", this.model.get("iTo")).html(this.template(this.model.toJSON()));

            return this;
        },
        choose: function () {
            this.$el.addClass('active').siblings().removeClass('active');
        }
    });
});