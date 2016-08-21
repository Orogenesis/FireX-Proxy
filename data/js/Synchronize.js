$(() => {
    /**
     * @param {String} method
     * @param {Backbone.Model} model
     * @param {Object} options
     * @returns {void}
     */
    Backbone.sync = function (method, model, options) {
        addon.port.emit(`${model.port}.${method}`, model.toJSON(options));
    };
});