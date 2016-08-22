class MenuEntryView extends Backbone.View {
    /**
     * @returns {string}
     */
    get tagName() {
        return 'a';
    }

    /**
     * @returns {Object}
     */
    get events() {
        return {
            'click': 'choose'
        };
    }

    /**
     * @returns {*}
     */
    get template() {
        return _.template($("#menu-entry-template").html());
    }

    /**
     * @returns {void}
     */
    initialize() {
        this.listenTo(this.model, 'change', this.render);
    }

    /**
     * @returns {MenuEntryView}
     */
    render() {
        this.$el.html(this.template(this.model.toJSON()));

        return this;
    }

    /**
     * @returns {Object}
     */
    attributes() {
        return {
            href: this.model.get('iTo')
        };
    }

    /**
     * @returns {void}
     */
    choose() {
        _.each(this.collection.without(this.model), (function (entry) {
            entry.set({
                iActive: false
            })
        }));

        this.model.set({
            iActive: true
        });
    }
}