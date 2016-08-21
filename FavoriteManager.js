const { BaseRepository } = require('./BaseRepository.js');

/**
 * @param {JReader} io
 * @constructor
 * @returns {void}
 */
function FavoriteManager(io) {
    BaseRepository.call(this, io);
}

FavoriteManager.prototype = Object.create(BaseRepository.prototype);

exports.FavoriteManager = FavoriteManager;