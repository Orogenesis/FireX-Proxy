const { Cc, Cu, Ci } = require("chrome");
const { NetUtil }    = Cu.import("resource://gre/modules/NetUtil.jsm");
const { FileUtils }  = Cu.import("resource://gre/modules/FileUtils.jsm");

/**
 * @param {String} filePath
 * @constructor
 * @returns {void}
 */
function FileReader(filePath) {
    this.fileObject = FileUtils.getFile("ProfD", [filePath]);
}

/**
 *
 * @type {number}
 */
FileReader.MODE_RDONLY = 0x01;
/**
 * @type {number}
 */
FileReader.MODE_WRONLY = 0x02;
/**
 * @type {number}
 */
FileReader.MODE_CREATE = 0x08;
/**
 * @type {number}
 */
FileReader.MODE_APPEND = 0x10;
/**
 * @type {number}
 */
FileReader.MODE_TRUNCATE = 0x20;

FileReader.prototype = {
    /**
     * Write to a file
     * @param {String} string
     * @returns {void}
     */
    write: function (string) {
        this.streamWrite(FileUtils.openFileOutputStream(this.fileObject, FileReader.MODE_WRONLY | FileReader.MODE_CREATE | FileReader.MODE_TRUNCATE), string);
    },
    /**
     * Append to a file
     * @param {String} string
     * @returns {void}
     */
    append: function (string) {
        this.streamWrite(FileUtils.openFileOutputStream(this.fileObject, FileReader.MODE_WRONLY | FileReader.MODE_CREATE | FileReader.MODE_APPEND), string);
    },
    /**
     * @param {FileUtils.nsIFileOutputStream} ostream
     * @param {String} string
     * @returns {void}
     */
    streamWrite: function (ostream, string) {
        let converter = Cc["@mozilla.org/intl/scriptableunicodeconverter"]
            .createInstance(Ci.nsIScriptableUnicodeConverter);

        converter.charset = "UTF-8";

        /**
         * Copy a data from source input stream to an output stream
         */
        let inputStream = converter.convertToInputStream(string + '\n');

        NetUtil.asyncCopy(inputStream, ostream, (status) => {
            if (!this.isSuccessCode(status)) {
                return 1;
            }

            /**
             * Close file output stream
             */

            FileUtils.closeSafeFileOutputStream(ostream);
        });
    },
    /**
     * @returns {Promise}
     */
    readAll: function () {
        return new Promise(resolve => {
            NetUtil.asyncFetch(this.fileObject, (inputStream, status) => {
                if (!this.isSuccessCode(status)) {
                    return resolve([]);
                }

                return resolve(NetUtil.readInputStreamToString(inputStream, inputStream.available()).split("\n"));
            });
        });
    },
    /**
     * @param {String} string
     * @returns {void}
     */
    removeLine: async function (string) {
        let response = await this.readAll();

        this.write(response.filter(n => n !== string).join('\n'));
    },
    /**
     * @returns {void}
     */
    clearFile: function () {
        FileUtils.closeSafeFileOutputStream(FileUtils.openSafeFileOutputStream(this.fileObject));
    },
    /**
     * @returns {Boolean}
     */
    isExists: function () {
        return this.fileObject.exists();
    },
    /**
     * @param returnCode
     * @returns {Boolean}
     */
    isSuccessCode: function (returnCode) {
        return !(returnCode & 0x80000000);
    },
    /**
     * @returns {void}
     */
    deleteFile: function () {
        if (this.isExists()) {
            this.fileObject.remove(false);
        }
    }
};

exports.FileReader = FileReader;