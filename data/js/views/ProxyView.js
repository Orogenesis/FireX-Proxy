class ProxyView extends Backbone.View {
    /**
     * @returns {void}
     */
    constructor() {
        super();

        this.tagName = 'tr';
        this.template = _.template($('#server-template').html());

        this.events = {
            'click': 'toggleActive',
            'click .checkbox-square': 'addFavorite'
        };
    }

    /**
     * @returns {void}
     */
    initialize() {
        this.listenTo(this.model, 'change', this.render);
    }

    /**
     * @returns {ProxyView}
     */
    render() {
        this.$el.html(this.template(this.model.toJSON())).toggleClass('active', this.model.get('iActive'));

        this.$('.checkbox-square').toggleClass('active', this.model.get('iFavorite'));

        return this;
    }

    /**
     * @returns {void}
     */
    toggleActive() {
        _.each(Router.proxyCollection.without(this.model), (function (proxy) {
            proxy.set({
                iActive: false
            })
        }));

        if (this.model.toggle()) {
            addon.port.emit("connect", this.model.toJSON());
        } else {
            addon.port.emit("disconnect");
        }
    }

    /**
     * @returns {boolean}
     */
    addFavorite() {
        this.model.favorite();
        this.$('.checkbox-square').toggleClass('active', this.model.get('iFavorite'));

        return false;
    }
}