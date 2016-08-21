import Router from './routers/Router';
import Locales from '../locale/Locales';

$(() => {
    var l10n = new Polyglot();
    var router = new Router();

    addon.port.once('onLocaleResponse', (locale) => {
        l10n.extend(Locales[locale]);
        router.currentView.update();
    });

    Backbone.history.start();

    window.Router = router;
    window.l10n = l10n;
});