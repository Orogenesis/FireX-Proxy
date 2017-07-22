const { BaseRepository } = require('./BaseRepository.js');

exports.FavoriteManager = class extends BaseRepository {
    /**
     * @param {JsonReader} io
     */
    constructor(io) {
        super(io);
    }
};