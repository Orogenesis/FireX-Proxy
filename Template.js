const { URL } = require("sdk/url");

/**
 * @returns {void}
 */
function Template(address) {
    this.setAddress(address);
}

Template.prototype = {
    /**
     * @param {String} address
     * @returns {void}
     */
    setAddress: function (address) {
        this.address = URL(address).origin;
    }
};

exports.Template = Template;