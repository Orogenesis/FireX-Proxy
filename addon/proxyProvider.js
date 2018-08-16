class ProxyModel {
    constructor(raw = {}) {
        this.server     = raw.server;
        this.port       = parseInt(raw.port);
        this.isoCode    = raw.iso_code;
        this.country    = raw.country;
        this.protocol   = raw.protocol;
        this.pingTimeMs = parseInt(raw.ping_time_ms);
        this.lossRatio  = parseInt(raw.loss_ratio);
    }
}

class ProxyProvider {
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
        return new Promise(
            (resolve, reject) => {
                fetch(`${this.baseUrl}/proxy`)
                    .then(response => response.json())
                    .then(response => {
                        resolve(response.map(raw => new ProxyModel(raw)));
                    })
                    .catch(reject);
            }
        );
    }
}
