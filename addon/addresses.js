import { Address } from './address.js'

export class Addresses extends Array {
    /**
     * @param {Array.<Address>} args
     * @returns {Addresses}
     */
    static create(args) {
        let self = new this();

        self.push.apply(self, args);

        return self;
    }

    /**
     * @returns {boolean}
     */
    isEmpty() {
        return this.length === 0;
    }

    /**
     * @param {string} ipAddress
     * @returns {Addresses}
     */
    byIpAddress(ipAddress) {
        return Addresses.create(
            this.filter(
                element => element.getIPAddress() === ipAddress
            )
        );
    }

    /**
     * @param {number} port
     * @returns {Addresses}
     */
    byPort(port) {
        return Addresses.create(
            this.filter(
                element => element.getPort() === port
            )
        );
    }

    /**
     * @returns {Addresses}
     */
    byFavorite() {
        return Addresses.create(
            this.filter(
                element => element.isFavorite()
            )
        );
    }

    /**
     * @returns {Addresses}
     */
    byExcludeFavorites() {
        return Addresses.create(
            this.filter(
                element => !element.isFavorite()
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
    unique() {
        return Addresses.create(
            this.filter(
                (element, pos, arr) => arr.findIndex(value => value.getIPAddress() === element.getIPAddress() && value.getPort() === element.getPort()) === pos
            )
        );
    }

    /**
     * @param {Addresses} elements
     * @returns {Addresses}
     */
    union(elements) {
        return Addresses.create(this.concat(elements).unique());
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

    /**
     * @returns {Addresses}
     */
    filterEnabled() {
        return Addresses.create(
            this.filter(
                element => element.isActive()
            )
        );
    }
}
