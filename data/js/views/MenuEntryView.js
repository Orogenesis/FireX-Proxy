export default class MenuEntryView extends Backbone.View {
    /**
     * @returns {void}
     */
    constructor() {
        super();

        this.tagName = 'a';
        this.template = _.template($("#menu-entry-template").html());

        this.events = {
            'click': 'choose'
        };
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
        _.each(Router.menuCollection.without(this.model), (function (entry) {
            entry.set({
                iActive: false
            })
        }));

        this.model.set({
            iActive: true
        });
    }
}