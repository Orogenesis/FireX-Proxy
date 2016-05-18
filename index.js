const self = require('sdk/self');
const { Hidemyass } = require('./Hidemyass.js');
const { ActionButton } = require("sdk/ui/button/action");
const { Panel } = require("sdk/panel");
const { Request } = require("sdk/request");

new Hidemyass().getList(function (list) {
    console.error(list);
});

var panel = Panel({
    contentURL: './html/list.html',
    height: 300,
    width: 400
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