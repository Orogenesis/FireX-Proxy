const { uuid } = require('sdk/util/uuid');

/**
 * @param {JsonReader} io
 * @returns {void}
 */
function BaseRepository(io) {
    this.base = [];
    this.io   = io;

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
     * @param {Object} jsonObject
     * @returns {Object}
     */
    add: function (jsonObject) {
        jsonObject.id = this.uuid();

        this.base.push(jsonObject);

        this.io.write(this.base);

        return jsonObject;
    },
    /**
     * @returns {void}
     */
    load: async function () {
        this.set(
            await this.io.readAll()
        );
    },
    /**
     * @param {Number} id
     * @param {Object} jsonObject
     * @throws {Error}
     * @returns {void}
     */
    modify: function (id, jsonObject) {
        this.base[this.find(id)] = jsonObject;

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
     * @param {Number} id
     * @returns {Number}
     * @throws {Error}
     */
    find: function (id) {
        let index = this.base.findIndex(element => element.id === id);

        if (index === -1) {
            throw new Error('The element not found.');
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