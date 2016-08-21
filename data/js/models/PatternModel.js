export default class PatternModel extends Backbone.Model {
    /**
     * @returns {void}
     */
    constructor() {
        super();

        this.port = 'blacklist';
        this.defaults = {
            iUri: null,
            iEditable: false
        };
    }

    /**
     * @returns {void}
     */
    initialize() {
        this.set('id', Router.bCounter++);
    }

    /**
     * @returns {void}
     */
    toggleEditable() {
        this.set({
            iEditable: !this.isEditable()
        });
    }

    /**
     * @returns {boolean}
     */
    isEditable() {
        return this.get('iEditable');
    }
}