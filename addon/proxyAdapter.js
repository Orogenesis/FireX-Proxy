class ProxyAdapter {
    /**
     * @returns {Promise}
     * @resolve {Addresses}
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