const { Hidemyass } = require('./Hidemyass.js');
const { ActionButton } = require("sdk/ui/button/action");
const { Panel } = require("sdk/panel");
const { Address } = require('./Address.js');
const { Connector } = require('./Connector.js');
const { TemplateManager } = require('./TemplateManager.js');
const { FavoriteManager } = require('./FavoriteManager.js');
const { JReader } = require('./JReader.js');
const { Template } = require('./Template.js');

const locale = require('sdk/l10n/locale');
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

const templatesStream = new JReader('firex-templates');
const proxyStream     = new JReader('firex-proxy');
const tManager        = new TemplateManager(templatesStream);
const connector       = new Connector(tManager);
const fManager        = new FavoriteManager(proxyStream);
const hideMyAss       = new Hidemyass();

panel.on('show', function () {
    var preferedLocales = locale.getPreferedLocales(true).shift();

    panel.port.emit('onLocaleResponse', preferedLocales.split('-').shift());
});

panel.port
    .on("connect", (server) =>
        connector.start(
            new Address(
                server.ipAddress,
                server.port,
                server.protocol,
                server.country
            )
        )
    ).on("disconnect", () =>
        connector.stop()
    ).on("blacklist.create", (pattern) =>
        panel.port.emit('onCreatePattern', tManager.add(new Template(pattern.address)))
    ).on("blacklist.read", () =>
        panel.port.emit("onPattern", tManager.all())
    ).on("blacklist.delete", (sync) =>
        tManager.rm(sync.id)
    ).on("blacklist.update", (sync) =>
        tManager.modify(sync.id, new Template(sync))
    ).on("favorite.read", () => {
        connector.stop();
        hideMyAss.getList((list) => panel.port.emit("onList", list.concat(fManager.all())));
    }).on("favorite.create", (proxy) =>
        panel.port.emit('onCreateFavorite', fManager.add(proxy))
    ).on("favorite.delete", (sync) =>
        fManager.rm(sync.id)
    ).on("toggleTemplate", (state) =>
        tManager.setTemplateState(state)
    );

exports.onUnload = function (reason) {
    switch (reason) {
        case 'uninstall':
        case 'upgrade':
            templatesStream.deleteFile();
            proxyStream.deleteFile();

            break;
    }
};