const { Hidemyass } = require('./Hidemyass.js');
const { ActionButton } = require("sdk/ui/button/action");
const { Panel } = require("sdk/panel");
const { Address } = require('./Address.js');
const { Connector } = require('./Connector.js');
const { TemplateManager } = require('./TemplateManager.js');
const { FavoriteManager } = require('./FavoriteManager.js');
const { JReader } = require('./JReader.js');

const self = require('sdk/self');

const panel = Panel({
    contentURL: './html/index.html',
    height: 350,
    width: 400
});

const actionButton = ActionButton({
    id: "firex-action",
    label: "FireX Proxy",
    icon: {
        "16": "./icons/icon-16.png",
        "24": "./icons/icon-24.png",
        "32": "./icons/icon-32.png"
    },
    onClick: function () {
        panel.show({
            position: actionButton
        });
    }
});

/**
 * @type {TemplateManager}
 */
const tManager = new TemplateManager(new JReader('firex-templates'));

/**
 * @type {Connector}
 */
const connector = new Connector(tManager);

/**
 * @type {FavoriteManager}
 */
const fManager = new FavoriteManager(new JReader('firex-proxy'));

/**
 * @type {Hidemyass}
 */
const hideMyAss = new Hidemyass();

panel.on('show', function () {
    panel.port.emit('onLocaleResponse', require('sdk/l10n/locale').getPreferedLocales(true).shift().split('-').shift());
});

panel.port.on("favorite.read", () => {
    connector.stop();
    hideMyAss.getList((list) => panel.port.emit("onList", list.concat(fManager.all())));
});

panel.port.on("connect", (server) => connector.start(new Address(server.ipAddress, server.port, server.protocol, server.country)))
    .on("disconnect", () => connector.stop())
    .on("blacklist.create", (pattern) => tManager.add(pattern))
    .on("blacklist.read", () => panel.port.emit("onPattern", tManager.all()))
    .on("blacklist.delete", (sync) => tManager.rm(sync.id))
    .on("blacklist.update", (sync) => tManager.modify(sync.id, sync))
    .on("favorite.create", (proxy) => fManager.add(proxy))
    .on("favorite.delete", (sync) => fManager.rm(sync.id))
    .on("toggleTemplate", (state) => tManager.setTemplateState(state));