class Patterns extends Backbone.Collection {
    /**
     * @returns {void}
     */
    constructor() {
        super();

        this.model = PatternModel;
        this.iCounter = 0;
    }

    /**
     * @returns {string}
     */
    get port() {
        return 'blacklist';
    }

    /**
     * @returns {void}
     */
    initialize() {
        this.bind('remove', this.onRemove, this);
    }

    /**
     * @param {Backbone.Model} model
     * @param {Backbone.Collection} collection
     * @param {Object} options
     * @returns {void}
     */
    onRemove(model, collection, options) {
        --this.iCounter;

        this.decrease(model);
    }

    /**
     * @param {Backbone.Model} model
     * @returns {void}
     */
    decrease(model) {
        this.each((b) => {
            if (b.get('id') > model.get('id')) {
                b.set('id', b.get('id') - 1);
            }
        });
    }
}