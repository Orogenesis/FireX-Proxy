const { BaseRepository } = require('./BaseRepository.js');

function TemplateManager() {
    BaseRepository.call(this);

    this.setTemplateState(false);
}

TemplateManager.prototype = Object.create(BaseRepository.prototype);

TemplateManager.prototype = {
    /**
     * @returns {Array}
     */
    allLinks: function () {
        return this.tList.map(function (n) {
            return n.iUri;
        });
    },
    /**
     * @returns {Boolean}
     */
    isTemplateEnabled: function () {
        return this.tEnabled;
    },
    /**
     * @param {Boolean} state
     * @returns {void}
     */
    setTemplateState: function (state) {
        this.tEnabled = state;
    },
    /**
     * @returns {String}
     */
    getFileName: function () {
        return 'FireX-blacklist.json';
    }
};

exports.TemplateManager = TemplateManager;