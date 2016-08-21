import PatternView from './PatternView';
import PatternModel from '../models/PatternModel';

export default class PatternPageView extends Backbone.View {
    /**
     * @returns {void}
     */
    constructor() {
        super();

        this.id = 'pattern';
        this.template = _.template($('#pattern-page-template').html());

        this.events = {
            'submit #new-entry': 'create',
            'click .checkbox-square': 'toggleTemplates'
        };
    }

    /**
     * @returns {void}
     */
    initialize() {
        this.listenTo(Router.bCollection, 'add', this.addOne);
        this.listenTo(Router.bCollection, 'reset', this.addAll);

        Router.templatesToggle || (Router.templatesToggle = false);

        Router.bCollection.fetch();
    }

    /**
     * @returns {PatternPageView}
     */
    render() {
        this.$el.html(this.template());

        this.list = this.$('.h-max');
        this.input = this.$('input[name=address]');
        this.form = this.$('#new-entry');
        this.templateToggleButton = this.$('.checkbox-square');

        if (Router.templatesToggle) {
            this.templateToggleButton.addClass('active');
        }

        Router.bCollection.each(this.addOne, this);

        return this;
    }

    /**
     * @returns {void}
     */
    toggleTemplates() {
        Router.templatesToggle = !Router.templatesToggle;

        this.templateToggleButton.toggleClass('active', Router.templatesToggle);

        addon.port.emit("toggleTemplate", Router.templatesToggle);
    }

    /**
     * @param {Object} event
     * @returns {void}
     */
    create(event) {
        event.preventDefault();

        var createdValue = this.input.val().trim();

        if (createdValue.length) {
            var bPattern = new PatternModel({
                iUri: createdValue
            });

            bPattern.save({
                success() {
                    Router.bCollection.add(bPattern);
                }
            });

            this.form[0].reset();
        }
    }

    /**
     * @returns {void}
     */
    addAll() {
        Router.bCollection.each(this.addOne, this);
    }

    /**
     * @param {Backbone.Model} pattern
     * @returns {void}
     */
    addOne(pattern) {
        var view = new PatternView({
            model: pattern
        });

        this.list.append(view.render().el);
    }
}