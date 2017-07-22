const { FileReader } = require('./FileReader.js');

class JsonReader extends FileReader {
    /**
     * @param {String} filePath
     */
    constructor(filePath) {
        super(`${filePath}.json`);
    }

    /**
     * @param {Object} jsonObject
     * @returns {void}
     */
    write(jsonObject) {
        super.write(JSON.stringify(jsonObject));
    }

    /**
     * @param {Function} callback
     * @returns {void}
     */
    readAll(callback) {
        super.readAll(data => {
            if (!data.length) {
                return callback([]);
            }

            return callback(JSON.parse(data.join('\n')));
        });
    }
}

exports.JsonReader = JsonReader;