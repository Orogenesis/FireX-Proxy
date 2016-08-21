const { BaseRepository } = require('./BaseRepository.js');

/**
 * @param {JReader} io
 * @constructor
 * @returns {void}
 */
function TemplateManager(io) {
    BaseRepository.call(this, io);

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

exports.TemplateManager = TemplateManager;