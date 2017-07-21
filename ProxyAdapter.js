class ProxyAdapter {
    /**
     * @returns {Promise}
     */
    static getList() {
        throw new Error('Unimplemented');
    }

    /**
     * @returns {String}
     */
    static get providerUrl() {
        throw new Error('Unimplemented');
    }
}

exports.ProxyAdapter = ProxyAdapter;