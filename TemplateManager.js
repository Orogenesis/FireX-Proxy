const { JReader } = require('./JReader.js');

function TemplateManager() {
    this.tList = [];
    this.setTemplateState(false);
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
     * @returns {Array}
     */
    allLinks: function () {
        return this.tList.map(function (n) {
            return n.iUri;
        });
    },
    /**
     * @param {Array} array
     */
    set: function (array) {
        this.tList = array;
    },
    /**
     * @returns {JReader}
     */
    getReader: function () {
        return new JReader(TemplateManager.TEMPLATE_FILE);
    },
    /**
     * @param {Object} jObject
     * @returns {void}
     */
    add: function (jObject) {
        this.tList.push(jObject);

        this.getReader().write(this.tList);
    },
    /**
     * @returns {void}
     */
    load: function () {
        var __this = this;

        this.getReader().readAll(function (a) {
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

            this.getReader().write(this.tList);
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

            this.getReader().write(this.tList);
        } else {
            throw new Error();
        }
    },
    /**
     * @returns {Boolean}
     */
    isTemplateEnabled: function () {
        return this.tEnabled;
    },
    /**
     * @param {Boolean} state
     * @returns {void}
     */
    setTemplateState: function (state) {
        this.tEnabled = state;
    },
};

exports.TemplateManager = TemplateManager;