var FireX = FireX || {};

$(function () {
    FireX.MenuView = Backbone.View.extend({
        el: '#menu',
        initialize: function () {
            (function (that) {
                FireX.menuList.forEach(function (item, i) {
                    that.$el.append(new FireX.MenuEntryView({
                        model: item
                    }).render().el);
                })
            })(this);
        }
    });
});
