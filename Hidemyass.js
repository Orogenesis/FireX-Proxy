const { WebScraping } = require('./WebScraping.js');
const { Address } = require('./Address.js');
const { Request } = require('sdk/request');

function Hidemyass() {}

Hidemyass.prototype = {
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
    getList: function (callback) {
        this.pull().then(function (response) {
            var a = [];

            response.forEach(function (row, i) {
                var lastUpdate = response.next().value;
                var address = response.next().value;
                var port = response.next().value;
                var country = response.next().value;
                var speed = response.next().value;
                var connectionTime = response.next().value;
                var connectionType = response.next().value;

                a.push(new Address(address, port, connectionType, country));
            });

            callback(a);
        });
    },
    makeRequest: function (callback) {
        return Request({
            url: this.getProviderUri(),
            onComplete: callback
        });
    },
    getProviderUri: function () {
        return 'http://proxylist.hidemyass.com/search-1304002';
    },
    __toDOM: function (string) {
        return new DOMParser().parseFromString(string);
    },
    __tableGenerator: function* (dRow) {
        var dCells = dTable.querySelectorAll("td");

        dCells.forEach(function (cell, i) {
            yield cell;
        });
    },
    properties: {
        table: '#listable'
    },
};