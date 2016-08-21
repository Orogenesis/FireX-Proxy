const { FileReader } = require('./FileReader.js');

/**
 * @param {String} fPath
 * @constructor
 * @returns {void}
 */
function JReader(fPath) {
    FileReader.call(this, `${fPath}.json`);
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
        if (!data.length) {
            return callback([]);
        }

        return callback(JSON.parse(data.join("\n")));
    });
};

exports.JReader = JReader;