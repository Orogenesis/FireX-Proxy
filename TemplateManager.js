const { BaseRepository } = require('./BaseRepository.js');

exports.TemplateManager = class extends BaseRepository {
    /**
     * @param {JsonReader} io
     */
    constructor(io) {
        super(io);

        this.templateEnabled = false;
    }

    /**
     * @param {boolean} state
     * @returns {TemplateManager}
     */
    setTemplateState(state) {
        this.templateEnabled = state;

        return this;
    }

    /**
     * @returns {boolean}
     */
    isTemplateEnabled () {
        return this.templateEnabled;
    }

    /**
     * @returns {Array}
     */
    allLinks() {
        return this.base.map(n => n.address);
    }
};