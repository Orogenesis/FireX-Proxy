export default class MenuView extends Backbone.View {
    /**
     * @returns {void}
     */
    constructor() {
        super();

        this.el = '#menu';
    }

    /**
     * @returns {void}
     */
    initialize() {
        this.listenTo(Router.menuCollection, "add", this.addOne);
    }

    /**
     * @param {Backbone.Model} menu
     * @returns {void}
     */
    addOne(menu) {
        this.$el.append(new MenuEntryView({
            model: menu
        }).render().el);
    }
}