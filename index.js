const self = require('sdk/self');
const { Hidemyass } = require('./Hidemyass.js');
const { ActionButton } = require("sdk/ui/button/action");
const { Panel } = require("sdk/panel");
const { Address } = require('./Address.js');
const { Connector } = require('./Connector.js');
const { TemplateManager } = require('./TemplateManager.js');
const { FavoriteManager } = require('./FavoriteManager.js');
const { JReader } = require('./JReader.js');

var panel = Panel({
    contentURL: './html/index.html',
    height: 350,
    width: 400
});

/**
 * @type {TemplateManager}
 */
var tManager = new TemplateManager(new JReader('firex-templates'));

/**
 * @type {Connector}
 */
var connector = new Connector(tManager);

/**
 * @type {FavoriteManager}
 */
var fManager = new FavoriteManager(new JReader('firex-proxy'));

panel.on('show', function () {
    panel.port.emit('onLocaleResponse', require('sdk/l10n/locale').getPreferedLocales(true).shift().split('-').shift());
});

panel.port.on("getList", function (response) {
    connector.stop();

    new Hidemyass().getList(function (list) {
        panel.port.emit("onList", list);
    });
}).on("connect", function (server) {
    connector.start(new Address(server.ipAddress, server.port, server.protocol, server.country));
}).on("disconnect", function () {
    connector.stop();
}).on("blacklist.create", function (pattern) {
    tManager.add(pattern);
}).on("blacklist.read", function () {
    panel.port.emit("onPattern", tManager.all());
}).on("blacklist.delete", function (sync) {
    tManager.rm(sync.id);
}).on("blacklist.update", function (sync) {
    tManager.modify(sync.id, sync);
}).on("toggleTemplate", function (state) {
    tManager.setTemplateState(state);
}).on("favorite.create", function (proxy) {
    fManager.add(proxy);
}).on("favorite.delete", function (id) {
    fManager.rm(id);
}).on("favorite.read", function () {
    panel.port.emit("onFavorites", fManager.all());
});

var button = ActionButton({
    id: "firex-action",
    label: "FireX Proxy",
    icon: {
        "16": "./icons/icon-16.png",
        "24": "./icons/icon-24.png",
        "32": "./icons/icon-32.png"
    },
    onClick: function () {
        panel.show({
            position: button
        });

        panel.port.emit('onMenuOpen');
    }
});