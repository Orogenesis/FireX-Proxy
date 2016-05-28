function Address(address, port, protocol, country) {
    this.setIPAddress(address);
    this.setPort(port);
    this.setProxyProtocol(protocol);
    this.setCountry(country);
}

Address.prototype = {
    /**
     * @param {String} address
     * @returns {void}
     */
    setIPAddress: function (address) {
        this.ipAddress = address;
    },
    /**
     * @returns {String|*}
     */
    getIPAddress: function () {
        return this.ipAddress;
    },
    /**
     * @param {String} port
     * @returns {void}
     */
    setPort: function (port) {
        this.port = port;
    },
    /**
     * @returns {String|*}
     */
    getPort: function () {
        return this.port;
    },
    /**
     * @param {String} country
     * @returns {void}
     */
    setCountry: function (country) {
        this.country = country;
    },
    /**
     * @returns {String|*}
     */
    getCountry: function () {
        return this.country;
    },
    /**
     * @param {String} protocol
     * @returns {void}
     */
    setProxyProtocol: function (protocol) {
        this.protocol = this.__toValidProtocol(protocol.toLowerCase());
        this.setOriginalProtocol(protocol);
    },
    /**
     * @returns {String}
     */
    getProxyProtocol: function () {
        return this.protocol;
    },
    /**
     * @param {String} protocol
     * @returns {void}
     */
    setOriginalProtocol: function (protocol) {
        this.originalProtocol = protocol;
    },
    /**
     * @returns {String}
     */
    getOriginalProtocol: function () {
        return this.originalProtocol;
    },
    /**
     * @param protocol
     * @returns {String}
     * @private
     */
    __toValidProtocol: function (protocol) {
        var list = this.__protocolsList();

        for (var i in list) {
            if (list.hasOwnProperty(i)) {
                if (protocol == list[i]) {
                    return i;
                }
            }
        }

        return protocol;
    },
    /**
     * @returns {{socks: string}}
     * @private
     */
    __protocolsList: function () {
        return {
            socks: 'socks4/5',
            http: 'https'
        };
    }
};

exports.Address = Address;