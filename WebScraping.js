const { IArray } = require('./IArray.js');

function WebScraping() {
    this.hNodes = [];
}

WebScraping.prototype = {
    /**
     * @param {Element} jCell
     * @returns {{asArray, asString}}
     */
    cellToAddress: function (jCell) {
        var a = [];

        for (var i = 0; i < jCell.length; ++i) {
            a.push(this.nodeToByte(jCell[i]));
        }

        a = IArray.filterNumeric(a);

        return {
            asArray: function () {
                return a;
            },
            asString: function () {
                return a.join('.');
            }
        };
    },
    nodeToByte: function (jNode) {
        var __byte = parseFloat(jNode.textContent.trim());

        var hidden = this.getHiddenNodes();

        if (!isNaN(__byte) && (__byte % 1) !== 0) {
            __byte *= (Math.pow(10, __byte.toString().length - 2));
            __byte = ~~__byte;
        }

        if (jNode.nodeType == 3) {
            return __byte;
        } else if (jNode.style.display !== 'none' && hidden.indexOf(jNode.className) < 0) {
            if (jNode.tagName.toLowerCase() == 'span') {
                return __byte;
            }
        }
    },
    /**
     * @param {String} stylesheet
     * @returns {Array}
     */
    setHiddenNodes: function (stylesheet) {
        var match;
        var list = [];
        var regExp = this.__hiddenStylesExpression();

        while ((match = regExp.exec(stylesheet)) !== null) {
            list.push(match.slice(-1).toString());
        }

        this.hNodes = list;
    },
    /**
     * @returns {Array}
     */
    getHiddenNodes: function () {
        return this.hNodes;
    },
    /**
     * @returns {RegExp}
     * @private
     */
    __hiddenStylesExpression: function () {
        return /\.([\da-z\-\_]+).display\:none/ig;
    }
};

exports.WebScraping = WebScraping;