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
            FireX.menuList = new FireX.Menu();

            FireX.menuList.create({
                iTo: '#/index',
                iIcon: 'list',
                iText: 'Список прокси'
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

            new FireX.MenuView();

            this.index();
        },
        index: function() {
            this.content.html(new FireX.ListView().render().el);
        },
        patterns: function () {
            this.content.html(new FireX.PatternView().render().el);
        }
    });
});