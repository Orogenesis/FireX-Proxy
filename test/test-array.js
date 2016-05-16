var { IArray } = require('../IArray.js');

exports['test isNumeric'] = function (assert) {
    var tArray = [1, 2, "Hello, World!", 3];

    assert.ok(IArray.filterNumeric(tArray).length = tArray.length - 1);
};

require("sdk/test").run(exports);