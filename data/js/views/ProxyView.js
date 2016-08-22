class ProxyView extends Backbone.View {
    /**
     * @returns {string}
     */
    get tagName() {
        return 'tr';
    }

    /**
     * @returns {*}
     */
    get template() {
        return _.template($('#server-template').html());
    }

    /**
     * @returns {Object}
     */
    get events() {
        return {
            'click': 'toggleActive',
            'click .checkbox-square': 'add'
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
        _.each(this.collection.without(this.model), (proxy) => {
            proxy.set({
                iActive: false
            })
        });

        if (this.model.toggle()) {
            addon.port.emit("connect", this.model.toJSON());
        } else {
            addon.port.emit("disconnect");
        }
    }

    /**
     * @returns {boolean}
     */
    add() {
        this.model.set({
            iFavorite: !this.model.get('iFavorite')
        });

        return false;
    }
}