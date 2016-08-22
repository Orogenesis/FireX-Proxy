class ListView extends Backbone.View {
    /**
     * @returns {*}
     */
    get template() {
        return _.template($('#list-template').html());
    }

    /**
     * @returns {Object}
     */
    get events() {
        return {
            'click .refresh': 'update',
            'click .h-manage': 'toggleFavorites'
        };
    }

    /**
     * @returns {void}
     */
    initialize() {
        this.listenTo(this.collection, 'reset', this.addAll);
        this.listenTo(this.collection, 'change:iFavorite', this.onChange);

        Router.listMode || (Router.listMode = false);

        addon.port.on('onList', (response) => this.onList(response));
    }

    /**
     * @returns {ListView}
     */
    render() {
        this.$el.html(this.template());

        this.table = this.$('#proxy-list-box');
        this.hBox = this.$('.h-box');
        this.favoriteCheckbox = this.$('.checkbox-square');

        this.favoriteCheckbox.toggleClass('active', Router.listMode);

        this.addAll();

        return this;
    }

    /**
     * @returns {void}
     */
    update() {
        this.collection.fetch();

        Router.listMode = false;
        this.favoriteCheckbox.toggleClass('active', Router.listMode);

        this.hBox.addClass('spinner');
        this.table.empty();
    }

    /**
     * @param {Backbone.Model} proxy
     * @returns {void}
     */
    addOne(proxy) {
        if (proxy.get('iFavorite')) {
            proxy.set('id', this.collection.iCounter++);
        }

        var view = new ProxyView({
            model: proxy,
            collection: this.collection
        });

        this.table.append(view.render().el);
    }

    /**
     * @returns {void}
     */
    addAll() {
        this.table.empty();

        _.each(this.collection.where({
            iFavorite: Router.listMode
        }), this.addOne, this);
    }

    /**
     * @returns {void}
     */
    onList(list) {
        this.hBox.removeClass('spinner');

        this.collection.reset(this.collection.filter((item) => item.get('iActive')).concat(list));
    }

    /**
     * @returns {void}
     */
    toggleFavorites() {
        Router.listMode = !Router.listMode;

        this.favoriteCheckbox.toggleClass('active', Router.listMode);

        this.addAll();
    }

    /**
     * @param {Backbone.Model} model
     * @param {String} value
     * @param {Array} options
     * @returns {void}
     */
    onChange(model, value, options) {
        if (!value) {
            model.destroy();
            model.unset('id');

            this.collection.decrease(model);
        } else {
            model.save();
        }
    }
}