const { JReader } = require('./JReader.js');

function TemplateManager() {
    this.tList = [];

    this.load();
}

TemplateManager.TEMPLATE_FILE = "FireX-patterns.json";

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
     * @param {Object} jObject
     * @returns {void}
     */
    add: function (jObject) {
        this.tList.push(jObject);

        new JReader(TemplateManager.TEMPLATE_FILE).write(this.tList);
    },
    /**
     * @returns {void}
     */
    load: function () {
        var __this = this;

        new JReader(TemplateManager.TEMPLATE_FILE).readAll(function (a) {
            __this.set(a || []);
        });
    },
    /**
     * @param {Number} id
     * @param {Object} jObject
     * @throws {Error}
     * @returns {void}
     */
    modify: function (id, jObject) {
        if (this.tList[id] !== undefined) {
            this.tList[id] = jObject;

            new JReader(TemplateManager.TEMPLATE_FILE).write(this.tList);
        } else {
            throw new Error();
        }
    },
    /**
     * @param {Number} id
     * @throws {Error}
     * @returns {void}
     */
    rm: function (id) {
        if (this.tList[id] !== undefined) {
            this.tList.splice(id, 1);

            new JReader(TemplateManager.TEMPLATE_FILE).write(this.tList);
        } else {
            throw new Error();
        }
    }
};

exports.TemplateManager = TemplateManager;