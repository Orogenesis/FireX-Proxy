class ListView extends Backbone.View {
    /**
     * @param {Object} options
     * @returns {void}
     */
    constructor(options) {
        super(options);

        this.listenTo(this.collection, 'reset', this.addAll);
        this.listenTo(this.collection, 'change:iFavorite', this.onChange);

        this.listenTo(this.model, 'change:hCheckbox', this.onCheckboxChange);
        this.listenTo(this.model, 'change:refreshProcess', this.onRefreshProcess);

        addon.port.on('onList', (response) => this.onList(response));
    }

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
     * @returns {ListView}
     */
    render() {
        this.$el.html(this.template());
        this.delegateEvents();

        this.$table = this.$('#proxy-list-box');
        this.$hBox = this.$('.h-box');
        this.$fCheckbox = this.$('.checkbox-square');

        this.addAll();
        this.$fCheckbox.toggleClass('active', this.model.get('hCheckbox'));

        if (this.$table.is(':empty')) {
            this.update();
        }

        return this;
    }

    /**
     * @returns {void}
     */
    update() {
        this.collection.fetch();
        this.model.startRefreshProcess();

        this.$table.empty();
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

        this.$table.append(view.render().el);
    }

    /**
     * @returns {void}
     */
    addAll() {
        this.$table.empty();

        _.each(this.collection.where({
            iFavorite: this.model.get('hCheckbox')
        }), this.addOne, this);
    }

    /**
     * @returns {void}
     */
    onList(list) {
        this.collection.reset(this.collection.filter((item) => item.get('iActive')).concat(list));
        this.model.stopRefreshProcess();
    }

    /**
     * @param {Backbone.Model} model
     * @param {String} value
     * @param {Array} options
     * @returns {void}
     */
    onCheckboxChange(model, value, options) {
        this.$fCheckbox.toggleClass('active', value);
        this.addAll();
    }

    /**
     * @param {Backbone.Model} model
     * @param {String} value
     * @param {Array} options
     * @returns {void}
     */
    onRefreshProcess(model, value, options) {
        this.$hBox.toggleClass('spinner', value);
    }

    /**
     * @returns {void}
     */
    toggleFavorites() {
        this.model.set('hCheckbox', !this.model.get('hCheckbox'));
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