export default class ProxyServerModel extends Backbone.Model {
    /**
     * @returns {void}
     */
    constructor() {
        super();

        this.defaults = {
            ipAddress: null,
            originalProtocol: null,
            country: null,
            iActive: false,
            iFavorite: false,
            port: null
        };

        this.port = 'favorite';
    }

    /**
     * @returns {void}
     */
    initialize() {
        if (this.get('iFavorite')) {
            this.set('id', Router.lCounter++);
        }
    }

    /**
     * @returns {boolean}
     */
    toggle() {
        this.set({
            iActive: !this.get('iActive')
        });

        return this.get('iActive');
    }

    /**
     * @returns {void}
     */
    favorite() {
        this.save({
            iFavorite: !this.get('iFavorite')
        });

        if (!this.get('iFavorite')) {
            --Router.lCounter;

            this.unset('id');
        } else {
            ++Router.lCounter;

            this.set('id', Router.lCounter - 1);
        }
    }
}