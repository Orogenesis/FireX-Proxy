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
        this.activeState      = false;
        this.favoriteState    = false;
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
     * @returns {boolean}
     */
    isActive() {
        return this.activeState;
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

    /**
     * @returns {boolean}
     */
    getActiveState() {
        return this.activeState;
    }

    /**
     * @param {boolean} value
     * @returns {Address}
     */
    setActiveState(value) {
        this.activeState = value;

        return this;
    }

    /**
     * @returns {Address}
     */
    enable() {
        this.setActiveState(true);

        return this;
    }

    /**
     * @returns {Address}
     */
    disable() {
        this.setActiveState(false);

        return this;
    }

    /**
     * @returns {boolean}
     */
    isFavorite() {
        return this.favoriteState;
    }

    /**
     * @returns {Address}
     */
    toggleFavorite() {
        this.setFavorite(Boolean(this.favoriteState ^ 1));

        return this;
    }

    /**
     * @param {boolean} state
     * @returns {Address}
     */
    setFavorite(state) {
        this.favoriteState = state;

        return this;
    }
}