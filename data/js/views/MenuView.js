var FireX = FireX || {};

$(function () {
    FireX.MenuView = Backbone.View.extend({
        el: '#menu',
        initialize: function () {
            this.listenTo(FireX.Menu, "add", this.addOne);
            this.listenTo(FireX.l10n, "locale", this.reRender);
        },
        addOne: function (menu) {
            this.$el.append(new FireX.MenuEntryView({
                model: menu
            }).render().el);
        },
        reRender: function () {
            this.$el.empty();

            FireX.Menu.each(this.addOne, this);
        }
    });
});
