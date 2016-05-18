const self = require('sdk/self');
const { Hidemyass } = require('./Hidemyass.js');
const { ActionButton } = require("sdk/ui/button/action");
const { Panel } = require("sdk/panel");

var panel = Panel({
    contentURL: './html/list.html',
    height: 300,
    width: 400
});

panel.port.on("getList", function (response) {
    new Hidemyass().getList(function (list) {
        panel.port.emit("onList", list);
    });
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
    }
});