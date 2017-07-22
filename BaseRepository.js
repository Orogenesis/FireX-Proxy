const { uuid } = require('sdk/util/uuid');

/**
 * @param {JsonReader} io
 * @returns {void}
 */
function BaseRepository(io) {
    this.base = [];
    this.io = io;

    this.load();
}

BaseRepository.prototype = {
    /**
     * @returns {Array}
     */
    all: function () {
        return this.base;
    },
    /**
     * @param {Array} array
     */
    set: function (array) {
        this.base = array;
    },
    /**
     * @param {Object} jObject
     * @returns {Object}
     */
    add: function (jObject) {
        jObject.id = this.uuid();

        this.base.push(jObject);
        this.io.write(this.base);

        return jObject;
    },
    /**
     * @returns {void}
     */
    load: function () {
        (function (that) {
            that.io.readAll(function (a) {
                that.set(a);
            });
        })(this);
    },
    /**
     * @param {Number} id
     * @param {Object} jObject
     * @throws {Error}
     * @returns {void}
     */
    modify: function (id, jObject) {
        this.base[this.find(id)] = jObject;

        this.io.write(this.base);
    },
    /**
     * @param {Number} id
     * @throws {Error}
     * @returns {void}
     */
    rm: function (id) {
        this.base.splice(this.find(id), 1);
        this.io.write(this.base);
    },
    /**
     * @param {String} id
     * @returns {Number}
     */
    find: function (id) {
        var index = this.base.findIndex(function (element, index, array) {
            return element.id === id;
        });

        if (index == -1) {
            throw new Error();
        }

        return index;
    },
    /**
     * @returns {String}
     */
    uuid: function () {
        let uuidLocal = String(uuid());

        return uuidLocal.substring(1, uuidLocal.length - 1);
    }
};

exports.BaseRepository = BaseRepository;