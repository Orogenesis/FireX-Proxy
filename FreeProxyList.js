const { Address } = require('./Address.js');
const { Request } = require('sdk/request');
const { IArray }  = require('./IArray');
const { Cc, Ci }  = require('chrome');
const DOMParser   = Cc["@mozilla.org/xmlextras/domparser;1"]
    .createInstance(Ci.nsIDOMParser);

/**
 * FreeProxyList.net adapter
 */
class FreeProxyList {
    /**
     * @returns {string}
     */
    static get protocolConstant() {
        return 'http';
    }

    /**
     * @param {Function} callback
     * @returns {void}
     */
    getList(callback) {
        Request({
            url: this.providerUrl,
            onComplete: (completeResponse) => {
                let
                    tree = DOMParser.parseFromString(completeResponse.text, "text/html"),
                    node = tree.querySelector(this.tableName),
                    data = []
                ;

                if (typeof node === 'object') {
                    let tableRows = node.querySelectorAll('tbody tr');

                    tableRows.forEach(
                        (currentRow, index) => {
                            let rowValues = [...currentRow.querySelectorAll('td')]
                                .map(column => column.textContent.trim());

                            let proxyListObject = IArray.fillKeys(
                                this.tableKeys,
                                rowValues
                            );

                            data.push(
                                new Address(
                                    proxyListObject.ipAddress,
                                    proxyListObject.port,
                                    FreeProxyList.protocolConstant,
                                    proxyListObject.countryPretty
                                )
                            );
                        }
                    )
                }

                callback(data);
            }
        }).get();
    }

    /**
     * @returns {Array}
     */
    get tableKeys() {
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
     * @returns {string}
     */
    get tableName() {
        return '#proxylisttable';
    }

    /**
     * @returns {string}
     */
    get providerUrl() {
        return 'https://free-proxy-list.net';
    }
}

exports.FreeProxyList = FreeProxyList;