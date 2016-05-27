const { FileReader } = require('./FileReader.js');

function JReader(fPath) {
    FileReader.call(this, fPath);
}

JReader.prototype = Object.create(FileReader.prototype);

JReader.prototype = {
    /**
     * @param {Object} jObject
     * @returns {void}
     */
    write: function (jObject) {
        FileReader.prototype.write.call(this, JSON.stringify(jObject));
    },
    /**
     * @param {Function} callback
     * @returns {void}
     */
    readAll: function (callback) {
        FileReader.prototype.readAll.call(this, function (data) {
            callback(JSON.parse(data));
        });
    }
};