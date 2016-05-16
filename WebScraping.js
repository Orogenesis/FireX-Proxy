function WebScraping() {
    this.hNodes = [];
}

WebScraping.prototype = {
    nodeToByte: function (jNode) {
        var __byte = parseFloat(jNode.textContent.trim());
        var hidden = this.getHiddenNodes();

        if (!isNaN(__byte) && (__byte % 1) !== 0) {
            __byte *= (Math.pow(10, __byte.toString().length - 2));
            __byte = ~~__byte;
        }

        if (jNode.nodeType == Node.TEXT_NODE) {
            return __byte;
        } else if (jNode.style.display != 'none' && hidden.indexOf(jNode.className) < 0) {
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

        while ((match = this.__hiddenStylesExpression().exec(stylesheet)) !== null) {
            list.push(match.slice(-1).toString());
        }

        return list;
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
        return new RegExp('\.([\da-z\-\_]+).display\:none', 'ig');
    }
};

exports.WebScraping = WebScraping;