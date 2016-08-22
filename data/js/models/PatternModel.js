class PatternModel extends Backbone.Model {
    /**
     * @returns {string}
     */
    get port() {
        return 'blacklist';
    }

    /**
     *
     * @returns {Object}
     */
    get defaults() {
        return {
            iUri: null,
            iEditable: false
        };
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