var FireX = FireX || {};

$(function () {
    FireX.MenuEntryView = Backbone.View.extend({
        template: _.template($("#menu-entry-template").html()),
        events: {'click':'choose'},
        initialize: function () {

        },
        render: function () {
            this.$el.html(this.template(this.model.toJSON()));

            return this;
        },
        choose: function () {
            //TODO: fix. No reaction.
            this.$el.addClass('.active').siblings().removeClass('.active');
        }
    });
    FireX.MenuView = Backbone.View.extend({
        template: _.template($("#menu-template").html()),
        initialize: function () {

        },
        render: function () {
            this.$el.html(this.template());
            this.ul = this.$('#menu-list');
            (function (that) {
                FireX.menuList.forEach(function (item, i) {
                    that.ul.append(new FireX.MenuEntryView({model: item}).render().el);
                })
            })(this);
            
            return this;
        },
    });
});
