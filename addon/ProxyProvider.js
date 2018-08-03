class ProxyProvider {
    /**
     * @param {string} remote
     */
    constructor(remote) {
        this.baseUrl = remote || 'http://firexproxy.com:4040/v1';
    }

    /**
     * @returns {Promise<any>}
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
