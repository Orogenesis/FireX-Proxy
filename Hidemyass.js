const { WebScraping } = require('./WebScraping.js');
const { Address } = require('./Address.js');
const { Request } = require('sdk/request');

function Hidemyass() {}

Hidemyass.prototype = {
    /**
     * @returns {Promise}
     */
    pull: function () {
        (function (__self) {
            return new Promise(function (resolve, reject) {
                this.makeRequest(function (response) {
                    var dTree = __self.__toDOM(response.text);

                    var dTable = dTree.querySelector(__self.properties.table);
                    var dRow = dTable.querySelectorAll("tbody tr");

                    var a = [];

                    dRow.forEach(function (row, i) {
                        a.push(__self.__tableGenerator(row));
                    });

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

            response.forEach(function (row, i) {
                var lastUpdate      = row.next().value;
                var address         = row.next().value;
                var port            = row.next().value;
                var country         = row.next().value;
                var speed           = row.next().value;
                var connectionTime  = row.next().value;
                var connectionType  = row.next().value;

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
        });
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
        return new DOMParser().parseFromString(string);
    },
    /**
     * @param {Element} dRow
     * @returns void
     */
    __tableGenerator: function* (dRow) {
        var dCells = dTable.querySelectorAll("td");

        dCells.forEach(function (cell, i) {
            yield cell;
        });
    },
    /**
     * @type {Object}
     */
    properties: {
        table: '#listable'
    },
};