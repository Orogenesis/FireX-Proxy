function TemplateManager() {
    this.tList = [];

    this.load();
}

TemplateManager.prototype = {
    /**
     * @returns {Array}
     */
    all: function () {
        return this.tList;
    },
    /**
     * @param {Array} array
     */
    set: function (array) {
        this.tList = array;
    },
    /**
     * @param {String} str
     * @returns {void}
     */
    add: function (str) {
        this.tList.push(str);

        this.__toFile(str);
    },
    /**
     * @param {String} str
     * @returns {void}
     */
    rm: function (str) {
        if ((__index = this.tList.indexOf(str)) !== -1) {
            /**
             * Remove a template from the array
             */
            this.tList.splice(__index, 1);

            /**
             * Remove a template from the file
             */
            this.__rmLine(str);
        }
    },
    /**
     * @returns {void}
     */
    load: function () {
        var __this = this;

        new FileReader().readAll(function (a) {
             __this.set(a);
        });
    },
    /**
     * @param {String} str
     * @returns {void}
     * @private
     */
    __toFile: function (str) {
        new FileReader().append(str);
    },
    /**
     * @param {String} str
     * @returns {void}
     * @private
     */
    __rmLine: function (str) {
        new FileReader().removeLine(str);
    }
};

exports.TemplateManager = TemplateManager;