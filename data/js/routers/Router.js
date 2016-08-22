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

        this.createMenu();
        this.index();
    }

    /**
     * @returns {void}
     */
    index() {
        this.currentView = new ListView({
            collection: this.pCollection
        });

        this.content.html(this.currentView.render().el);
    }

    /**
     * @returns {void}
     */
    patterns() {
        this.currentView = new PatternPageView({
            collection: this.bCollection
        });

        this.content.html(this.currentView.render().el);
    }

    /**
     * @returns {void}
     */
    createMenu() {
        this.menuView = new MenuView({
            collection: this.mCollection
        });

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