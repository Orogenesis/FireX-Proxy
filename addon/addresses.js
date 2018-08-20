import { Address } from "./address.js";

export class Addresses extends Array {
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
     * @param {number} port
     * @returns {Addresses}
     */
    byPort(port) {
        return this.create(
            this.filter(
                element => element.getPort() === port
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
     * @returns {Addresses}
     */
    byExcludeFavorites() {
        return this.create(
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
        return this.create(
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
        return this.create(this.concat(elements).unique());
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
        return this.create(
            this.filter(
                element => element.isActive()
            )
        );
    }
}
