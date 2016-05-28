const self = require('sdk/self');
const { Hidemyass } = require('./Hidemyass.js');
const { ActionButton } = require("sdk/ui/button/action");
const { Panel } = require("sdk/panel");
const { Address } = require('./Address.js');
const { Connector } = require('./Connector.js');
const { TemplateManager } = require('./TemplateManager.js');

var panel = Panel({
    contentURL: './html/index.html',
    height: 350,
    width: 400
});

/**
 * @type {TemplateManager}
 */
var tManager = new TemplateManager();

/**
 * @type {Connector}
 */
var connector = new Connector(tManager);

panel.port.on("getList", function (response) {
    connector.stop();

    /**
     * Sends proxylist to frontend via port communication
     */

    new Hidemyass().getList(function (list) {
        panel.port.emit("onList", list);
    });
}).on("connect", function (server) {
    connector.start(new Address(server.iAddress, server.iPort, server.iProtocol, server.iCountry));
}).on("disconnect", function () {
    connector.stop();
}).on("addPattern", function (pattern) {
    tManager.add(pattern);
}).on("getPatterns", function () {
    /**
     * Sends array of templates to frontend via port communication
     */

    panel.port.emit("onPattern", tManager.all());
}).on("deletePattern", function (patternId) {
    tManager.rm(patternId);
}).on("updatePattern", function (patternId, newState) {
    tManager.modify(patternId, newState);
}).on("toggleTemplate", function (state) {
    tManager.setTemplateState(state);
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