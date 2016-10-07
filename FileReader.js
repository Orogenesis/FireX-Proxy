const { Cc, Cu, Ci } = require("chrome");
const { NetUtil } = Cu.import("resource://gre/modules/NetUtil.jsm");
const { FileUtils } = Cu.import("resource://gre/modules/FileUtils.jsm");

/**
 * @param {String} fPath
 * @constructor
 * @returns {void}
 */
function FileReader(fPath) {
    this.fObject = FileUtils.getFile("ProfD", [fPath]);
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
        this.streamWrite(FileUtils.openFileOutputStream(this.fObject, FileReader.MODE_WRONLY | FileReader.MODE_CREATE | FileReader.MODE_TRUNCATE), string);
    },
    /**
     * Append to a file
     * @param {String} string
     * @returns {void}
     */
    append: function (string) {
        this.streamWrite(FileUtils.openFileOutputStream(this.fObject, FileReader.MODE_WRONLY | FileReader.MODE_CREATE | FileReader.MODE_APPEND), string);
    },
    /**
     * @param {FileUtils.nsIFileOutputStream} ostream
     * @param {String} string
     * @returns {void}
     */
    streamWrite: function (ostream, string) {
        var converter = Cc["@mozilla.org/intl/scriptableunicodeconverter"].createInstance(Ci.nsIScriptableUnicodeConverter);

        converter.charset = "UTF-8";

        /**
         * Copy a data from source input stream to an output stream
         */

        var istream = converter.convertToInputStream(string + '\n');

        (function (that) {
            NetUtil.asyncCopy(istream, ostream, function (status) {
                if (!that.isSuccessCode(status)) {
                    return 1;
                }

                /**
                 * Close file output stream
                 */

                FileUtils.closeSafeFileOutputStream(ostream);
            });
        })(this);
    },
    /**
     * @param {Function} callback
     * @returns {void}
     */
    readAll: function (callback) {
        (function (that) {
            NetUtil.asyncFetch(that.fObject, function (inputStream, status) {
                if (!that.isSuccessCode(status)) {
                    return callback([]);
                }

                return callback(NetUtil.readInputStreamToString(inputStream, inputStream.available()).split("\n"));
            });
        })(this);
    },
    /**
     * @param {String} string
     * @returns {void}
     */
    removeLine: function (string) {
        this.readAll((response) => this.write(response.filter((n) => n !== string).join('\n')));
    },
    /**
     * @returns {void}
     */
    clearFile: function () {
        FileUtils.closeSafeFileOutputStream(FileUtils.openSafeFileOutputStream(this.fObject));
    },
    /**
     * @returns {Boolean}
     */
    isExists: function () {
        return this.fObject.exists();
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
            this.fObject.remove(false);
        }
    }
};

exports.FileReader = FileReader;