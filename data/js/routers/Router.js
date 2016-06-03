var FireX = FireX || {};

$(function () {
    FireX.Router = Backbone.Router.extend({
        content: $('#primary-content'),
        routes: {
            "index": 'index',
            "patterns": 'patterns',
            "favorite": 'favorite'
        },
        initialize: function () {
            FireX.increment = 0;

            new FireX.MenuView();

            FireX.Menu.create({
                iTo: '#/index',
                iIcon: 'list',
                iText: FireX.l10n.t("proxymenu", {
                    _: "List of proxies"
                }),
                iActive: true
            });

            FireX.Menu.create({
                iTo: '#/patterns',
                iIcon: 'settings',
                iText: FireX.l10n.t("blacklist", {
                    _: "Blacklist"
                })
            });

            FireX.ProxyList.fetch();

            this.index();
        },
        index: function () {
            this.currentView = new FireX.ListView();

            this.content.html(this.currentView.render().el);
        },
        patterns: function () {
            this.currentView = new FireX.PatternPageView();

            this.content.html(this.currentView.render().el);
        }
    });
});