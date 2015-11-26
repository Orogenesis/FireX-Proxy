Components.utils.import("resource://gre/modules/NetUtil.jsm");
Components.utils.import("resource://gre/modules/FileUtils.jsm");

function FileReader() {
    this.descriptor = null;
}

FileReader.prototype = {
    fileDescriptor: function () {
        this.descriptor = FileUtils.getFile("ProfD", ["FireX-Proxy-List.txt"]);
        return this;
    },
    write: function (string, append) {
        append = append || false;
        if (string) {
            var ostream = FileUtils.openFileOutputStream(this.descriptor, !append ? (0x02 | 0x08 | 0x20) : (0x02 | 0x08 | 0x10));
            var converter = Components.classes["@mozilla.org/intl/scriptableunicodeconverter"].
                createInstance(Components.interfaces.nsIScriptableUnicodeConverter);
            converter.charset = "UTF-8";
            var istream = converter.convertToInputStream(string + '\n');
            NetUtil.asyncCopy(istream, ostream, function (status) {
                if (!Components.isSuccessCode(status)) {
                    return;
                }
            });
        } else {
            FileUtils.closeSafeFileOutputStream(FileUtils.openSafeFileOutputStream(this.descriptor));
        }
    },
    readAll: function (callback) {
        NetUtil.asyncFetch(this.descriptor, function (inputStream, status) {
            if (!Components.isSuccessCode(status)) {
                return callback(null);
            }

            return callback(NetUtil.readInputStreamToString(inputStream, inputStream.available()).split('\n'));
        });
    },
    removeLine: function (string) {
        var self = this;
        this.readAll(function (data) {
            var temp_array = [];
            if (data) {
                for (var i = data.length - 1; i >= 0; --i) {
                    if (data[i] == string || !data[i].length) continue;
                    temp_array.unshift(data[i]);
                }

                self.write(temp_array.join('\n'));
            }
        });
    },
    clear: function () {
        this.write(null);
    }
};