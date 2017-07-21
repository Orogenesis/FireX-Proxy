exports.String = class StringHelper extends String {
    /**
     * @param {String} string
     * @returns {boolean}
     */
    static isNumeric(string) {
        return !(string % 1) && !isNaN(string) && isFinite(string);
    }
};

exports.Array = class ArrayHelper extends Array {
    /**
     * @param {Array} array
     * @returns {Array}
     */
    static filterNumeric(array) {
        return array.filter(element => StringHelper.isNumeric(element));
    }

    /**
     * @param {Array} keys
     * @param {Array} values
     * @returns {Object}
     * @throws {Error}
     */
    static fillKeys(keys, values) {
        if (keys.length === values.length) {
            for (var i = 0, fillKeysObject = {}; i < keys.length; ++i) {
                fillKeysObject[keys[i]] = values[i];
            }

            return fillKeysObject;
        }

        throw new Error("Error: 'keys' length must match 'values' length.");
    }
};