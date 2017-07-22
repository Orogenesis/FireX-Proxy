const { Address }      = require('./Address.js');
const { Request }      = require('sdk/request');
const { Array }        = require('./Helpers.js');
const { ProxyAdapter } = require('./ProxyAdapter.js');
const { Cc, Ci }       = require('chrome');
const DOMParser        = Cc["@mozilla.org/xmlextras/domparser;1"]
    .createInstance(Ci.nsIDOMParser);

class FreeProxyList extends ProxyAdapter {
    /**
     * @returns {string}
     */
    static get protocolConstant() {
        return Address.httpProtocolConstant.toLowerCase();
    }

    /**
     * @returns {Promise}
     */
    static getList() {
        return new Promise(resolve => {
            Request({
                url: FreeProxyList.providerUrl,
                onComplete: (completeResponse) => {
                    let
                        tree = DOMParser.parseFromString(completeResponse.text, "text/html"),
                        node = tree.querySelector(FreeProxyList.tableSelectorName),
                        data = []
                    ;

                    if (typeof node === 'object') {
                        let tableRows = node.querySelectorAll('tbody tr');

                        tableRows.forEach(
                            currentRow => {
                                let rowValues = [...currentRow.querySelectorAll('td')]
                                    .map(column => column.textContent.trim());

                                let proxyListObject = Array.fillKeys(
                                    FreeProxyList.tableKeys,
                                    rowValues
                                );

                                data.push(
                                    (new Address())
                                        .setIPAddress(proxyListObject.ipAddress)
                                        .setPort(proxyListObject.port)
                                        .setProxyProtocol(FreeProxyList.protocolConstant)
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
            }).get();
        });
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

exports.FreeProxyList = FreeProxyList;