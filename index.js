const self = require('sdk/self');
const { Hidemyass } = require('./Hidemyass.js');
const { ActionButton } = require("sdk/ui/button/action");
const { Panel } = require("sdk/panel");
const { Address } = require('./Address.js');
const { Connector } = require('./Connector.js');

var panel = Panel({
    contentURL: './html/index.html',
    height: 300,
    width: 400
});

/**
 * @type {Connector}
 */
var connector;

panel.port.on("getList", function (response) {
    new Hidemyass().getList(function (list) {
        panel.port.emit("onList", list);
    });
}).on("connect", function (server) {
    connector = new Connector(new Address(server.iAddress, server.iPort, server.iProtocol, server.iCountry));
    connector.start();
}).on("disconnect", function () {
    connector.stop();
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