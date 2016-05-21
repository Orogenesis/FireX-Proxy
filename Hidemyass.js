const { WebScraping } = require('./WebScraping.js');
const { Address } = require('./Address.js');
const { Request } = require('sdk/request');
const { Cc, Ci } = require('chrome');

const DOMParser = Cc["@mozilla.org/xmlextras/domparser;1"].createInstance(Ci.nsIDOMParser);

function Hidemyass() {}

Hidemyass.prototype = {
    /**
     * @returns {Promise}
     */
    pull: function () {
        return (function (__self) {
            return new Promise(function (resolve, reject) {
                __self.makeRequest(function (response) {
                    var dTree = __self.__toDOM(response.text);

                    var a = [];

                    var dTable = dTree.querySelector(__self.properties.table);

                    if (typeof dTable == 'object') {
                        var dRow = dTable.querySelectorAll("tbody tr");

                        for (var i = 0; i < dRow.length; ++i) {
                            a.push(__self.__tableGenerator(dRow[i]));
                        }
                    }

                    resolve(a);
                });
            });
        })(this);
    },
    /**
     * @param {Function} callback
     * @returns void
     */
    getList: function (callback) {
        this.pull().then(function (response) {
            var a = [];

            var webScraping = new WebScraping();

            response.forEach(function (row, i) {
                var lastUpdate      = row.next().value;
                var address         = row.next().value;

                webScraping.setHiddenNodes(address.querySelector('style').textContent);
                address             = webScraping.cellToAddress(address.firstElementChild.childNodes).asString();

                var port            = row.next().value;
                port                = port.textContent.trim();

                var country         = row.next().value;
                country             = country.firstElementChild.textContent.trim();

                var speed           = row.next().value;
                var connectionTime  = row.next().value;
                var connectionType  = row.next().value;
                connectionType      = connectionType.textContent.trim();

                a.push(new Address(address, port, connectionType, country));
            });

            callback(a);
        });
    },
    /**
     * @param {Function} callback
     * @returns {*}
     */
    makeRequest: function (callback) {
        return Request({
            url: this.getProviderUri(),
            onComplete: callback
        }).get();
    },
    /**
     * @returns {String}
     */
    getProviderUri: function () {
        return 'http://proxylist.hidemyass.com/search-1304002';
    },
    /**
     * @param {String} string
     * @returns {Document}
     * @private
     */
    __toDOM: function (string) {
        return DOMParser.parseFromString(string, "text/html");
    },
    /**
     * @param {Element} dRow
     * @returns void
     */
    __tableGenerator: function* (dRow) {
        var dCells = dRow.querySelectorAll("td");

        for (var i = 0; i < dCells.length; ++i) {
            yield dCells[i];
        }
    },
    /**
     * @type {Object}
     */
    properties: {
        table: '#listable'
    },
};

exports.Hidemyass = Hidemyass;