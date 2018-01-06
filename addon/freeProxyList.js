class FreeProxyList extends ProxyAdapter {
    /**
     * @returns {Promise}
     * @resolve {Addresses}
     */
    static getList() {
        return new Promise(
            (resolve, reject) => {
                let xmlHttpRequest = new XMLHttpRequest();

                xmlHttpRequest.addEventListener('readystatechange', () => {
                    if (xmlHttpRequest.readyState === XMLHttpRequest.DONE) {
                        let
                            tree = new DOMParser().parseFromString(xmlHttpRequest.responseText, "text/html"),
                            data = new Addresses(),
                            node = tree.querySelector(FreeProxyList.tableSelectorName)
                        ;

                        if (typeof node === 'object') {
                            let tableRows = node.querySelectorAll('tbody tr');

                            tableRows.forEach(
                                currentRow => {
                                    let rowValues = [...currentRow.querySelectorAll('td')]
                                        .map(column => column.textContent.trim());

                                    let proxyListObject = ArrayHelper.fillKeys(
                                        FreeProxyList.tableKeys,
                                        rowValues
                                    );

                                    data.push(
                                        (new Address())
                                            .setIPAddress(proxyListObject.ipAddress)
                                            .setPort(proxyListObject.port)
                                            .setCountry(proxyListObject.countryPretty)
                                            .setOriginalProtocol(
                                                proxyListObject.isHttps === 'yes'
                                                    ? Address.httpsProtocolConstant : Address.httpProtocolConstant
                                            )
                                    );
                                }
                            )
                        }

                        resolve(data);
                    }
                });

                xmlHttpRequest.addEventListener('error', () => {
                    reject(xmlHttpRequest.statusText);
                });

                xmlHttpRequest.open('GET', FreeProxyList.providerUrl);
                xmlHttpRequest.send();
            }
        );
    }

    /**
     * Provider table row columns
     *
     * @returns {Array}
     */
    static get tableKeys() {
        return [
            'ipAddress',
            'port',
            'countryCode',
            'countryPretty',
            'anonymityStatus',
            'isGoogle',
            'isHttps',
            'lastCheckedAgo'
        ];
    }

    /**
     * Table selector
     *
     * @returns {string}
     */
    static get tableSelectorName() {
        return '#proxylisttable';
    }

    /**
     * Provider url
     *
     * @returns {string}
     */
    static get providerUrl() {
        return 'https://free-proxy-list.net';
    }
}
