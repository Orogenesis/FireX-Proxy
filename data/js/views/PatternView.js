var FireX = FireX || {};

$(function () {
    FireX.PatternView = Backbone.View.extend({
        tagName: 'div',
        attributes: {
            'class': 'd-set'
        },
        events: {
            'click .d-rm' : 'destroy'
        },
        template: _.template($('#pattern-template').html()),
        initialize: function() {
            this.listenTo(this.model, 'change', this.render);
            this.listenTo(this.model, 'destroy', this.remove);
            
        },
        render: function () {
            this.$el.html(this.template(this.model.toJSON()));

            return this;
        },
        destroy: function () {
            this.model.destroy();
        }
    });
});