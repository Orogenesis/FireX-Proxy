export class ProxyModel {
    /**
     * @param {string} server
     * @returns {ProxyModel}
     */
    setServer(server) {
        this.server = server;

        return this;
    }

    /**
     * @param {number} port
     * @returns {ProxyModel}
     */
    setPort(port) {
        this.port = port;

        return this;
    }

    /**
     * @param {string} isoCode
     * @returns {ProxyModel}
     */
    setIsoCode(isoCode) {
        this.isoCode = isoCode;

        return this;
    }

    /**
     * @param {string} country
     * @returns {ProxyModel}
     */
    setCountry(country) {
        this.country = country;

        return this;
    }

    /**
     * @param {string} protocol
     * @returns {ProxyModel}
     */
    setProtocol(protocol) {
        this.protocol = protocol;

        return this;
    }

    /**
     * @param {number} pingTimeMs
     * @returns {ProxyModel}
     */
    setPingTimeMs(pingTimeMs) {
        this.pingTimeMs = pingTimeMs;

        return this;
    }

    /**
     * @param {float} lossRatio
     * @returns {ProxyModel}
     */
    setLossRatio(lossRatio) {
        this.lossRatio = lossRatio;

        return this;
    }
}

export class ProxyProvider {
    /**
     * @param {string} remote
     */
    constructor(remote = 'http://firexproxy.com:4040/v1') {
        this.baseUrl = remote;
    }

    /**
     * @returns {Promise<ProxyModel>}
     */
    getProxies() {
        return this.processFetch();
    }

    getRelevantProxies(token) {
        let options = {
            method: 'get',
            headers: new Headers({
                "Authentication": `Bearer ${token}`
            })
        };

        return this.processFetch('relevant', options);
    }

    processFetch(endpoint = 'proxy', options) {
        options = options || {}

        return new Promise(
            (resolve, reject) => {
                fetch(`${this.baseUrl}/${endpoint}`, options)
                    .then(response => response.json())
                    .then(response => {
                        resolve(
                            response.map(
                                raw => (new ProxyModel())
                                    .setServer(raw.server)
                                    .setPort(parseInt(raw.port))
                                    .setIsoCode(raw.iso_code)
                                    .setCountry(raw.country)
                                    .setProtocol(raw.protocol)
                                    .setPingTimeMs(parseInt(raw.ping_time_ms))
                                    .setLossRatio(raw.loss_ratio)
                            )
                        );
                    })
                    .catch(reject);
            }
        );
    }
}
