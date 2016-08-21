export default class MenuEntryModel extends Backbone.Model {
    /**
     * @returns {void}
     */
    constructor() {
        super();

        this.defaults = {
            iTo: null,
            iIcon: null,
            iText: null,
            iActive: false
        };
    }

    /**
     * @param {Object} attributes
     * @returns {*}
     */
    get(attributes) {
        var value = super.get(attributes);

        if (_.isFunction(value)) {
            return value.call(this);
        }

        return value;
    }

    /**
     * @returns {Object}
     */
    toJSON() {
        var data = {};
        var finite = super.toJSON();

        _.each(finite, function (value, key) {
            data[key] = this.get(key);
        }, this);

        return data;
    }
}