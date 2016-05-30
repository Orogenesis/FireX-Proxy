const { BaseRepository } = require('./BaseRepository.js');

function TemplateManager() {
    BaseRepository.call(this);

    this.setTemplateState(false);
}

TemplateManager.prototype = Object.create(BaseRepository.prototype);

/**
 * @returns {Array}
 */
TemplateManager.prototype.allLinks = function () {
    return this.tList.map(function (n) {
        return n.iUri;
    });
};

/**
 * @returns {Boolean}
 */
TemplateManager.prototype.isTemplateEnabled = function () {
    return this.tEnabled;
};
/**
 * @param {Boolean} state
 * @returns {void}
 */
TemplateManager.prototype.setTemplateState = function (state) {
    this.tEnabled = state;
};
/**
 * @returns {String}
 */
TemplateManager.prototype.getFileName = function () {
    return 'FireX-blacklist.json';
};

exports.TemplateManager = TemplateManager;