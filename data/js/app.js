var FireX = FireX || {};



$(function () {
    FireX.l10n = new Polyglot();
    _.extend(FireX.l10n, Backbone.Events);
    FireX.Router = new FireX.Router();

    Backbone.history.start();

    addon.port.on('onLocaleResponse', function (locale) {
        FireX.l10n.extend(FireX.Locales[locale]);

        FireX.l10n.trigger("locale");
    });
});