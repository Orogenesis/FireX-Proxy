class Addresses extends Array {
    /**
     * @param {...*} [args]
     */
    constructor(...args) {
        super(...args);
    }

    /**
     * @param {Array.<Address>} args
     * @returns {Addresses}
     */
    create(args) {
        return new this.constructor(...args);
    }

    /**
     * @returns {boolean}
     */
    isEmpty() {
        return this.length === 0;
    }

    /**
     * @param {...Address} [items]
     * @returns {Number}
     */
    insert(...items) {
        return this.unshift(...items);
    }

    /**
     * @param {string} ipAddress
     * @returns {Addresses}
     */
    byIpAddress(ipAddress) {
        return this.create(
            this.filter(
                element => element.getIPAddress() === ipAddress
            )
        );
    }

    /**
     * @returns {Addresses}
     */
    byFavorite() {
        return this.create(
            this.filter(
                element => element.isFavorite()
            )
        );
    }

    /**
     * @returns {Address}
     * @throws {Error}
     */
    one() {
        if (this.isEmpty()) {
            throw new Error('An array is empty.');
        }

        return this[0];
    }

    /**
     * @returns {Address}
     * @throws {Error}
     */
    clone() {
        return Object.assign(new Address(), this.one());
    }

    /**
     * @returns {Addresses}
     */
    disableAll() {
        this.forEach(
            element => element.disable()
        );

        return this;
    }
}