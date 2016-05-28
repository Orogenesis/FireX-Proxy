var FireX = FireX || {};

$(function () {
    FireX.PatternView = Backbone.View.extend({
        tagName: 'div',
        attributes: {
            'class': 'd-set'
        },
        events: {
            'click .d-rm':      'destroy',
            'dblclick .d-uri':  'edit',
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
            this.label = this.$('.d-uri');

            return this;
        },
        destroy: function () {
            this.model.destroy();
        },
        edit: function () {
            this.input.addClass('editing');
            this.label.hide();
            this.input.focus();
        },
        done: function () {
            if (!this.input.hasClass('editing')) {
                return;
            }

            this.input.removeClass('editing');
            this.label.show();

            if (this.input.val().trim()) {
                this.model.save({
                    iUri: this.input.val().trim()
                });
            } else {
                this.model.destroy();
            }

        }
    });
});