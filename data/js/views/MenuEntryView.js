var FireX = FireX || {};

$(function () {
    FireX.MenuEntryView = Backbone.View.extend({
        tagName: 'a',
        template: _.template($("#menu-entry-template").html()),
        events: {
            'click': 'choose'
        },

        initialize: function () {
            this.listenTo(this.model, 'change', this.render);

        },
        render: function () {
            this.$el.html(this.template(this.model.toJSON()));

            return this;
        },
        attributes: function () {
            return {
                href: this.model.get('iTo')
            };
        },
        choose: function () {
            _.each(FireX.Menu.without(this.model), (function (entry) {
                entry.save({
                    iActive: false
                })
            }));

            this.model.set({
                iActive: true
            });
        }
    });
});