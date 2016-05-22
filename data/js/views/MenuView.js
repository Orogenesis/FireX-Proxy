var FireX = FireX || {};

$(function () {
    FireX.MenuEntryView = Backbone.View.extend({
        template: _.template($("#menu-entry-template")),
        events: {'click':'choose'},
        initialize: function () {

        },
        render: function () {
            this.$el.html(this.template());

            return this;
        },
        choose: function () {
            this.$el.addClass('.active').siblings().removeClass('.active');
        }
    });
    FireX.MenuView = Backbone.View.extend({
        template: _.template($("#menu-template")),
        initialize: function () {

        },
        render: function () {
            this.$el.html(this.template());
            this.ul = this.$('#menu-list');
            (function (that) {
                FireX.menu.forEach(function (item, i) {
                    that.ul.append(new FireX.MenuEntryView({model: item}).render().el);
                })
            })(this);
            
            return this;
        },
    });
});
