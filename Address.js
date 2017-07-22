class Address {
    /**
     * @returns {string}
     */
    static get httpProtocolConstant() {
        return 'HTTP';
    }

    /**
     * @returns {string}
     */
    static get httpsProtocolConstant() {
        return 'HTTPS';
    }

    constructor() {
        this.ipAddress        = null;
        this.port             = null;
        this.country          = null;
        this.protocol         = null;
        this.originalProtocol = null;
    }

    /**
     * @param {String} address
     * @returns {Address}
     */
    setIPAddress(address) {
        this.ipAddress = address;

        return this;
    }

    /**
     * @returns {String}
     */
    getIPAddress() {
        return this.ipAddress;
    }

    /**
     * @param {String} port
     * @returns {Address}
     */
    setPort(port) {
        this.port = port;

        return this;
    }

    /**
     * @returns {Number}
     */
    getPort() {
        return this.port;
    }

    /**
     * @param {String} country
     * @returns {Address}
     */
    setCountry(country) {
        this.country = country;

        return this;
    }

    /**
     * @returns {String}
     */
    getCountry() {
        return this.country;
    }

    /**
     * @param {String} protocol
     * @returns {Address}
     */
    setProxyProtocol(protocol) {
        this.protocol = protocol;

        return this;
    }

    /**
     * @returns {String}
     */
    getProxyProtocol() {
        return this.protocol;
    }

    /**
     * @param {String} protocol
     * @returns {Address}
     */
    setOriginalProtocol(protocol) {
        this.originalProtocol = protocol;

        return this;
    }

    /**
     * @returns {String}
     */
    getOriginalProtocol() {
        return this.originalProtocol;
    }
}

exports.Address = Address;