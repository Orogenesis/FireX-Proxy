class ProxyStateModel extends Backbone.Model {
    /**
     * @returns {Object}
     */
    defaults() {
        return {
            hCheckbox: false,
            refreshProcess: false
        };
    }

    /**
     * @returns {void}
     */
    startRefreshProcess() {
        this.set('refreshProcess', true);
    }

    /**
     * @returns {void}
     */
    stopRefreshProcess() {
        this.set('refreshProcess', false);
    }
}