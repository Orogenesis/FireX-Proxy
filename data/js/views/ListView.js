import ProxyView from './ProxyView';

export default class ListView extends Backbone.View {
    /**
     * @returns {void}
     */
    constructor() {
        super();

        this.template = _.template($('#list-template').html());
        this.events = {
            'click .refresh': 'update',
            'click .h-manage': 'toggleFavorites'
        };
    }

    /**
     * @returns {void}
     */
    initialize() {
        this.listenTo(Router.ProxyList, 'reset', this.addAll);
        this.listenTo(Router.ProxyList, 'change:iFavorite', this.onChange);

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
        addon.port.emit('getList');

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
        var view = new ProxyView({
            model: proxy
        });

        this.table.append(view.render().el);
    }

    /**
     * @returns {void}
     */
    addAll() {
        this.table.empty();

        _.each(Router.proxyCollection.where({
            iFavorite: Router.listMode
        }), this.addOne, this);
    }

    /**
     * @returns {void}
     */
    onList(list) {
        this.hBox.removeClass('spinner');

        Router.proxyCollection.reset(Router.proxyCollection.filter((item) => item.get('iFavorite') || item.get('iActive')).concat(list));
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
            this.addAll();
        }
    }
}