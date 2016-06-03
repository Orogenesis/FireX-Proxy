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
                iText: function () {
                    return FireX.l10n.t("proxymenu",{
                        _:"Proxy list"
                    });
                },
                iActive: true
            });

            FireX.Menu.create({
                iTo: '#/patterns',
                iIcon: 'settings',
                iText: function () {
                    return FireX.l10n.t("blacklist",{
                        _:"Blacklist"
                    });
                }
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

});