import MenuEntryModel from '../models/MenuEntryModel';

export default class Menu extends Backbone.Collection {
    /**
     * @returns {void}
     */
    constructor() {
        super();

        this.model = MenuEntryModel;
        this.url = '/menu';
    }
}