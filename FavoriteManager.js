const { BaseRepository } = require('./BaseRepository.js');

function FavoriteManager() {
    BaseRepository.call(this);
}

FavoriteManager.prototype = Object.create(BaseRepository.prototype);

FavoriteManager.prototype = {
    /**
     * @returns {String}
     */
    getFileName: function () {
        return 'FireX-blacklist.json';
    }
};

exports.FavoriteManager = FavoriteManager;