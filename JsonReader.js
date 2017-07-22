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
     * @returns {Promise}
     */
    readAll() {
        return new Promise(resolve => {
            super.readAll()
                .then(response => {
                    if (!response.length) {
                        return resolve([]);
                    }

                    return resolve(JSON.parse(response.join('\n')));
                });
        });
    }
}

exports.JsonReader = JsonReader;