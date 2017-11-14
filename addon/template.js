class Template {
    /**
     * @param {String} address
     */
    constructor(address) {
        this.setAddress(address);
    }

    /**
     * @param {String} address
     * @returns {void}
     */
    setAddress(address) {
        this.address = new URL(address).origin;
    }
}