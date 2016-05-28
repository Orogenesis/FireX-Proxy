var FireX = FireX || {};

$(function () {
    FireX.PatternView = Backbone.View.extend({
        tagName: 'div',
        attributes: {
            'class': 'd-set'
        },
        events: {
            'click .d-rm':      'destroy',
            'click .d-uri':     'edit',
            'blur .edit':       'done'
        },
        template: _.template($('#pattern-template').html()),
        initialize: function () {
            this.listenTo(this.model, 'change', this.render);
            this.listenTo(this.model, 'destroy', this.remove);

        },
        render: function () {
            this.$el.html(this.template(this.model.toJSON()));

            this.input = this.$('.edit');

            return this;
        },
        destroy: function () {
            this.model.destroy();
        },
        edit: function () {
            this.model.toggleEditable();
            this.input.focus();
        },
        done: function () {
            if (this.model.isEditable()) {
                var text = this.input.val().trim();

                if (text) {
                    this.model.save({
                        iUri: text,
                        iEditable: false
                    });
                } else {
                    this.model.destroy();
                }
            }
        }
    });
});