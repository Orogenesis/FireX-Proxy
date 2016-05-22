var FireX = FireX || {};

$(function () {
    FireX.Router = Backbone.Router.extend({
        menu: $('#menu-holder'),
        content: $('#primary-content'),

        initialize: function () {
            FireX.menuList = new FireX.Menu();

            FireX.menuList.create({
                iTo: '#/list',
                iText: 'Список прокси'
            });

            FireX.menuList.create({
                iTo: '#/urls',
                iText: 'Шаблоны URL'
            });

            this.menu.html(new FireX.MenuView().render().el);
            
            this.index();
        },
        index: function() {
            var view = new FireX.ListView();

            this.content.html(view.render().el);
        }
    });
});