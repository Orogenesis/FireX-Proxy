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
            Backbone.history.start();

            FireX.menuList = new FireX.Menu();
            FireX.menuView = new FireX.MenuView();
            FireX.proxyList = new FireX.ProxyList();
            FireX.patterns = new FireX.Patterns();

            FireX.menuList.create({
                iTo: '#/index',
                iIcon: 'list',
                iText: 'Список прокси',
                iActive: true
            });

            FireX.menuList.create({
                iTo: '#/patterns',
                iIcon: 'settings',
                iText: 'Настройки'
            });

            FireX.menuList.create({
                iTo: '#/favorite',
                iIcon: 'star',
                iText: 'Избранное'
            });

            this.index();
        },
        index: function() {
            this.content.html(new FireX.ListView().render().el);
        },
        patterns: function () {
            this.content.html(new FireX.PatternPageView().render().el);
        },
        settings: function() {
            this.content.html('');
        }
    });

    FireX.router = new FireX.Router();
});