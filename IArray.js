var { IString } = require('./IString.js');

exports.IArray = {
    /**
     * @param {Array} a
     * @returns {Array}
     */
    filterNumeric: function (a) {
        return a.filter(function (n) {
            return IString.isNumeric(n);
        });
    },
    /**
     * @param {Array} keys
     * @param {Array} values
     * @returns {Object}
     * @throws {Error}
     */
    fillKeys: function (keys, values) {
        if (keys.length === values.length) {
            for (var i = 0, fillKeysObject = {}; i < keys.length; ++i) {
                fillKeysObject[keys[i]] = values[i];
            }

            return fillKeysObject;
        }

        throw new Error("Error: 'keys' length must match 'values' length.");
    }
};