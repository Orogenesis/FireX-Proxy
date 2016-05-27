const { FileReader } = require('./FileReader.js');

function JReader(fPath) {
    FileReader.call(this, fPath);
}

JReader.prototype = Object.create(FileReader.prototype);

/**
 * @param {Object} jObject
 * @returns {void}
 */
JReader.prototype.write = function (jObject) {
    FileReader.prototype.write.call(this, JSON.stringify(jObject));
};
/**
 * @param {Function} callback
 * @returns {void}
 */
JReader.prototype.readAll = function (callback) {
    FileReader.prototype.readAll.call(this, function (data) {
        callback(JSON.parse(data));
    });
};

exports.JReader = JReader;