const { BaseRepository } = require('./BaseRepository.js');

function FavoriteManager() {
    BaseRepository.call(this);
}

FavoriteManager.prototype = Object.create(BaseRepository.prototype);

/**
 * @returns {String}
 */
FavoriteManager.prototype.getFileName = function () {
    return 'FireX-mylist.json';
};


FavoriteManager.prototype.rm = function (id) {
    BaseRepository.prototype.rm.call(this, this.all().findIndex(function (elem, index, array) {
        return elem.iId == id;
    }));
};

exports.FavoriteManager = FavoriteManager;