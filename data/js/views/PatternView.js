class PatternView extends Backbone.View {
    /**
     * @returns {void}
     */
    constructor() {
        super();

        this.tagName = 'div';
        this.template = _.template($('#pattern-template').html());

        this.attributes = {
            'class': 'd-set'
        };

        this.events = {
            'click .d-rm': 'destroy',
            'click .d-uri': 'edit',
            'blur .edit': 'done'
        };
    }

    /**
     * @returns {void}
     */
    initialize() {
        this.listenTo(this.model, 'change', this.render);
        this.listenTo(this.model, 'destroy', this.remove);
    }

    /**
     * @returns {PatternView}
     */
    render() {
        this.$el.html(this.template(this.model.toJSON()));

        this.input = this.$('.edit');

        return this;
    }

    /**
     * @returns {void}
     */
    destroy() {
        this.model.destroy();
    }

    /**
     * @returns {void}
     */
    edit() {
        this.model.toggleEditable();
        this.input.focus();
    }

    /**
     * @returns {void}
     */
    done() {
        if (this.model.isEditable()) {
            var iText = this.input.val().trim();

            if (iText) {
                this.model.save({
                    iUri: iText,
                    iEditable: false
                });
            } else {
                this.destroy();
            }
        }
    }
}