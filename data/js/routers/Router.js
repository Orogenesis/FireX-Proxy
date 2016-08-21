import Backbone from 'Backbone';

import PatternPageView from '../views/PatternPageView';
import ListView from '../views/ListView';
import MenuView from '../views/MenuView';

import Menu from '../collections/Menu';
import ProxyList from '../collections/ProxyList';
import Patterns from '../collections/Patterns';

export default class Router extends Backbone.Router {
    /**
     * @returns {void}
     */
    constructor() {
        super();

        this.content = $('#primary-content');
        this.routes = {
            "index": 'index',
            "patterns": 'patterns',
            "favorite": 'favorite'
        };
    }

    /**
     * @returns {void}
     */
    initialize() {
        this.menuCollection = new Menu();
        this.proxyCollection = new ProxyList();
        this.bCollection = new Patterns();

        this.proxyCollection.fetch();

        this.createMenu();
        this.index();
    }

    /**
     * @returns {void}
     */
    index() {
        this.currentView = new ListView();
        this.content.html(this.currentView.render().el);
    }

    /**
     * @returns {void}
     */
    patterns() {
        this.currentView = new PatternPageView();
        this.content.html(this.currentView.render().el);
    }

    /**
     * @returns {void}
     */
    createMenu() {
        this.menuView = new MenuView();

        this.menuCollection.create({
            iTo: '#/index',
            iIcon: 'list',
            iText: l10n.t("proxymenu", { _: "List of proxies" }),
            iActive: true
        });

        this.menuCollection.create({
            iTo: '#/patterns',
            iIcon: 'settings',
            iText: l10n.t("blacklist", { _: "Blacklist" })
        });
    }
}