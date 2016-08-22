class ProxyServerModel extends Backbone.Model {
    /**
     * @returns {Object}
     */
    get defaults() {
        return {
            ipAddress: null,
            originalProtocol: null,
            country: null,
            iActive: false,
            iFavorite: false,
            port: null
        };
    }

    /**
     * @returns {string}
     */
    get port() {
        return 'favorite';
    }

    /**
     * @returns {boolean}
     */
    toggle() {
        this.set({
            iActive: !this.get('iActive')
        });

        return this.get('iActive');
    }
}