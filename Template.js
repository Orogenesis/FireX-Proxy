const { URL } = require("sdk/url");

class Template {
    /**
     * @param {String} address
     */
    constructor(address) {
        this.setAddress(address);
    }

    /**
     * @param {String} address
     * @returns {void}
     */
    setAddress(address) {
        this.address = URL(address).origin;
    }
}

exports.Template = Template;