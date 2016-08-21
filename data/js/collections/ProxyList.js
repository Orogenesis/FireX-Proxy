import ProxyServerModel from '../models/ProxyServerModel';

class ProxyList extends Backbone.Collection {
    /**
     * @returns {void}
     */
    constructor() {
        super();

        this.model = ProxyServerModel;
    }

    /**
     * @returns {void}
     */
    initialize() {
        addon.port.on("onFavorites", (favorites) => this.add(favorites));
    }
}