const { FreeProxyList }   = require('./FreeProxyList.js');
const { ActionButton }    = require("sdk/ui/button/action");
const { Panel }           = require("sdk/panel");
const { Address }         = require('./Address.js');
const { Connector }       = require('./Connector.js');
const { TemplateManager } = require('./TemplateManager.js');
const { FavoriteManager } = require('./FavoriteManager.js');
const { JReader }         = require('./JReader.js');
const { Template }        = require('./Template.js');
const locale              = require('sdk/l10n/locale');
const self                = require('sdk/self');

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
    onClick: () => {
        panel.show({
            position: actionButton
        });
    }
});

const templatesStream = new JReader('firex-templates');
const proxyStream     = new JReader('firex-proxy');
const templateManager = new TemplateManager(templatesStream);
const connector       = new Connector(templateManager);
const favoriteManager = new FavoriteManager(proxyStream);

panel.on('show', () => {
    let preferedLocales = locale.getPreferedLocales(true).shift();

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
        panel.port.emit('onCreatePattern', templateManager.add(new Template(pattern.address)))
    ).on("blacklist.read", () =>
        panel.port.emit("onPattern", templateManager.all())
    ).on("blacklist.delete", (sync) =>
        templateManager.rm(sync.id)
    ).on("blacklist.update", (sync) =>
        templateManager.modify(sync.id, new Template(sync))
    ).on("favorite.read", async () => {
        connector.stop();

        let proxyList = await FreeProxyList.getList();

        panel.port.emit("onList", proxyList.concat(favoriteManager.all()));
    }).on("favorite.create", (proxy) =>
        panel.port.emit('onCreateFavorite', favoriteManager.add(proxy))
    ).on("favorite.delete", (sync) =>
        favoriteManager.rm(sync.id)
    ).on("toggleTemplate", (state) =>
        templateManager.setTemplateState(state)
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