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
    }
};