import PatternModel from '../models/PatternModel';

class Patterns extends Backbone.Collection {
    /**
     * @returns {void}
     */
    constructor() {
        super();

        this.model = PatternModel;
        this.port = 'blacklist';
    }

    /**
     * @returns {void}
     */
    initialize() {
        addon.port.on("onPattern", (patterns) => this.reset(patterns));
    }
}