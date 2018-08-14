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
    constructor(remote) {
        this.baseUrl = remote || 'http://firexproxy.com:4040/v1';
    }

    /**
     * @returns {Promise<ProxyModel>}
     */
    getProxies() {
        return new Promise(
            (resolve, reject) => {
                let xmlHttpRequest = new XMLHttpRequest();

                xmlHttpRequest.addEventListener('readystatechange', () => {
                    if (xmlHttpRequest.readyState === XMLHttpRequest.DONE) {
                        resolve(
                            JSON.parse(xmlHttpRequest.responseText).map(
                                raw => new ProxyModel(raw)
                            )
                        );
                    }
                });

                xmlHttpRequest.addEventListener('error', () => {
                    reject(xmlHttpRequest.statusText);
                });

                xmlHttpRequest.open('GET', [this.baseUrl, 'proxy'].join('/'));
                xmlHttpRequest.send();
            }
        );
    }
}
