const DEFAULT_REMOTE = 'http://firexproxy.com:4040/v1';

class ProxyProvider {

    constructor (remote) {
        this.baseUrl = remote || DEFAULT_REMOTE;
    }

    getProxies () {
        return new Promise((resolve, reject) => {
            let xmlHttpRequest = new XMLHttpRequest();

            xmlHttpRequest.addEventListener('readystatechange', () => {
                if (xmlHttpRequest.readyState === XMLHttpRequest.DONE) {
                    let data = JSON.parse(xmlHttpRequest.responseText);
                    resolve(data.map((dto) => new ProxyModel(dto)));
                }
            });

            xmlHttpRequest.addEventListener('error', () => {
                reject(xmlHttpRequest.statusText);
            });

            xmlHttpRequest.open('GET', `${this.baseUrl}/proxy`);
            xmlHttpRequest.send();
        });
    }
}