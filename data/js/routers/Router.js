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
            new FireX.MenuView();

            FireX.Menu.create({
                iTo: '#/index',
                iIcon: 'list',
                iText: 'Список прокси',
                iActive: true
            });

            FireX.Menu.create({
                iTo: '#/patterns',
                iIcon: 'settings',
                iText: 'Настройки'
            });

            FireX.Menu.create({
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
        favorite: function() {
            this.content.empty();
        }
    });

    FireX.Router = new FireX.Router();
    Backbone.history.start();
});