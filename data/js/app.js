$(() => {
    window.l10n = new Polyglot();
    window.router = new Router();

    addon.port.once('onLocaleResponse', (locale) => {
        window.l10n.extend(Locales[locale]);
        window.router.currentView.update();
    });

    Backbone.history.start();
});