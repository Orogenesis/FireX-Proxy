var FireX = FireX || {};

$(function () {
    FireX.Router = Backbone.Router.extend({
        menu: $('#menu-holder'),
        content: $('#primary-content'),

        initialize: function () {
            FireX.menuList = new FireX.Menu();
            FireX.menuList.create({iTo: 'here', iText: 'click me'});
            
            this.menu.html(new FireX.MenuView().render().el);
            
            this.index();
        },
        index: function() {
            var view = new FireX.ListView();

            this.content.html(view.render().el);
        }
    });
});