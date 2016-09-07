$(() => {
    window.l10n = new Polyglot();

    addon.port.once('onLocaleResponse', (locale) => {
        l10n.extend(Locales[locale]);

        window.Router = new Router();
        Backbone.history.start();
    });
});