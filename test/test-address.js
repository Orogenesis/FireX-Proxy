var { Address } = require('../Address.js');

exports['test isRightProtocolSubstitution'] = function (assert) {
    var address = new Address();
    address.setProxyProtocol('socks4/5');
    assert.ok(address.getProxyProtocol() == 'socks');
};

exports['test isRightProtocol'] = function (assert) {
    var address = new Address();
    address.setProxyProtocol('https');
    assert.ok(address.getProxyProtocol() == 'https');
};

require("sdk/test").run(exports);