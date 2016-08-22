class MenuView extends Backbone.View {
    /**
     * @returns {string}
     */
    get el() {
        return '#menu';
    }

    /**
     * @returns {void}
     */
    initialize() {
        this.listenTo(this.collection, "add", this.addOne);
    }

    /**
     * @param {Backbone.Model} menu
     * @returns {void}
     */
    addOne(menu) {
        this.$el.append(new MenuEntryView({
            model: menu,
            collection: this.collection
        }).render().el);
    }
}