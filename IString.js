exports.IString = {
    /**
     * @param {String} a
     * @returns {boolean}
     */
    isNumeric: function (a) {
        return !(a % 1) && !isNaN(a) && isFinite(a);
    }
};