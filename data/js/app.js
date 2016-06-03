var FireX = FireX || {};



$(function () {
    FireX.l10n = new Polyglot();

    addon.port.once('onLocaleResponse', function (locale) {
        FireX.l10n.extend(FireX.Locales[locale]);

        FireX.Router = new FireX.Router();
        FireX.Router.currentView.update();
    });
    
    Backbone.history.start();
});