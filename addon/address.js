const pacDictionary = {
    'HTTP'   : 'PROXY',
    'HTTPS'  : 'PROXY',
    'SOCKS5' : 'SOCKS',
    'SOCKS4' : 'SOCKS'
};

const pacObjectDictionary = {
    'HTTP'   : 'http',
    'HTTPS'  : 'https',
    'SOCKS5' : 'socks',
    'SOCKS4' : 'socks4'
};

export class Address {
    constructor() {
        this.ipAddress     = null;
        this.port          = null;
        this.country       = null;
        this.protocol      = null;
        this.activeState   = false;
        this.favoriteState = false;
        this.pingTimeMs    = null;
        this.isoCode       = null;
        this.username      = null;
        this.password      = null;
    }

    /**
     * @param {string} address
     * @returns {Address}
     */
    setIPAddress(address) {
        this.ipAddress = address;

        return this;
    }

    /**
     * @returns {string}
     */
    getIPAddress() {
        return this.ipAddress;
    }

    /**
     * @param {number} port
     * @returns {Address}
     */
    setPort(port) {
        this.port = port;

        return this;
    }

    /**
     * @returns {number}
     */
    getPort() {
        return this.port;
    }

    /**
     * @param {string} country
     * @returns {Address}
     */
    setCountry(country) {
        this.country = country;

        return this;
    }

    /**
     * @returns {string}
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
     * @param {string} protocol
     * @returns {Address}
     */
    setProtocol(protocol) {
        this.protocol = protocol;

        return this;
    }

    /**
     * @returns {string}
     */
    getProtocol() {
        return this.protocol;
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
     * @returns {string}
     */
    getIsoCode() {
        return this.isoCode;
    }

    /**
     * @param {string} isoCode
     * @returns {Address}
     */
    setIsoCode(isoCode) {
        this.isoCode = isoCode;

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

    /**
     * @returns {number}
     */
    getPingTimeMs() {
        return this.pingTimeMs;
    }

    /**
     * @param {number} pingTimeMs
     * @returns {Address}
     */
    setPingTimeMs(pingTimeMs) {
        this.pingTimeMs = pingTimeMs;

        return this;
    }

    /**
     * @returns {string}
     * @throws {Error}
     */
    getPacProtocol() {
        if (pacDictionary[this.getProtocol()] === undefined) {
            throw new Error('This protocol unsupported by PAC');
        }

        return pacDictionary[this.getProtocol()];
    }

    /**
     * @returns {string}
     */
    getPac() {
        return `${this.getPacProtocol()} ${this.ipAddress}:${this.port}`;
    }

    /**
     * @returns {Object}
     */
    getPacObject() {
        return {
            type: pacObjectDictionary[this.getProtocol()],
            host: this.ipAddress,
            port: this.port,
            username: this.username || '',
            password: this.password || '',
            proxyDNS: this.getProtocol() === 'SOCKS5'
        }
    }

    /**
     * @param {string} username
     * @returns {Address}
     */
    setUsername(username) {
        this.username = username;

        return this;
    }

    /**
     * @param {string} password
     * @returns {Address}
     */
    setPassword(password) {
        this.password = password;

        return this;
    }

    /**
     * @returns {string}
     */
    getUsername() {
        return this.username;
    }

    /**
     * @returns {string}
     */
    getPassword() {
        return this.password;
    }
}
