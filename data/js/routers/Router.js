class Router extends Backbone.Router {
    /**
     * @returns {jQuery}
     */
    get content() {
        return $("#primary-content");
    }

    /**
     * @returns {Object}
     */
    get routes() {
        return {
            "index": 'index',
            "patterns": 'patterns',
            "favorite": 'favorite'
        };
    }

    /**
     * @returns {void}
     */
    initialize() {
        this.mCollection = new Menu();
        this.pCollection = new ProxyList();
        this.bCollection = new Patterns();

        var patternStateModel = new PatternStateModel();
        var proxyStateModel   = new ProxyStateModel();

        this.menuView = new MenuView({
            collection: this.mCollection
        });

        this.patternView = new PatternPageView({
            collection: this.bCollection,
            model: patternStateModel
        });

        this.listView = new ListView({
            collection: this.pCollection,
            model: proxyStateModel
        });

        this.createMenu();
        this.index();
    }

    /**
     * @returns {void}
     */
    index() {
        this.content.html(this.listView.render().el);
    }

    /**
     * @returns {void}
     */
    patterns() {
        this.content.html(this.patternView.render().el);
    }

    /**
     * @returns {void}
     */
    createMenu() {
        this.mCollection.create({
            iTo: '#/index',
            iIcon: 'list',
            iText: l10n.t("proxymenu", {_: "List of proxies"}),
            iActive: true
        });

        this.mCollection.create({
            iTo: '#/patterns',
            iIcon: 'settings',
            iText: l10n.t("blacklist", {_: "Blacklist"})
        });
    }
}