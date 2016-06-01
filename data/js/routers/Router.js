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
                iText: 'Proxy list',
                iActive: true
            });

            FireX.Menu.create({
                iTo: '#/patterns',
                iIcon: 'settings',
                iText: 'Blacklist'
            });
            
            FireX.ProxyList.fetch();
            
            this.index();
        },
        index: function() {
            this.content.html(new FireX.ListView().render().el);
        },
        patterns: function () {
            this.content.html(new FireX.PatternPageView().render().el);
        }
    });

    FireX.Router = new FireX.Router();
    Backbone.history.start();
});