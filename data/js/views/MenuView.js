var FireX = FireX || {};

$(function () {
    FireX.MenuView = Backbone.View.extend({
        el: '#menu',
        initialize: function () {
            this.listenTo(FireX.Menu, "add", this.addOne);
        },
        addOne: function (menu) {
            this.$el.append(new FireX.MenuEntryModel({
                model: menu
            }).render().el);
        },
        render: function () {
            return this;
        }
    });
});
