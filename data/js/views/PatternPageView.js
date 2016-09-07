class PatternPageView extends Backbone.View {
    /**
     * @returns {string}
     */
    get id() {
        return 'pattern';
    }

    /**
     * @returns {*}
     */
    get template() {
        return _.template($('#pattern-page-template').html());
    }

    /**
     * @returns {Object}
     */
    get events() {
        return {
            'submit #new-entry': 'create',
            'click .checkbox-square': 'toggleTemplates'
        };
    }

    /**
     * @returns {void}
     */
    initialize() {
        this.listenTo(this.collection, 'add', this.addOne);
        this.listenTo(this.collection, 'reset', this.addAll);

        Router.templatesToggle || (Router.templatesToggle = false);

        this.collection.fetch();

        addon.port.on("onPattern", (patterns) => this.collection.reset(patterns));
    }

    /**
     * @returns {PatternPageView}
     */
    render() {
        this.$el.html(this.template());

        this.$list = this.$('.h-max');
        this.$input = this.$('input[name=address]');
        this.$form = this.$('#new-entry');
        this.$templateToggleButton = this.$('.checkbox-square');

        if (Router.templatesToggle) {
            this.$templateToggleButton.addClass('active');
        }

        this.collection.each(this.addOne, this);

        return this;
    }

    /**
     * @returns {void}
     */
    toggleTemplates() {
        Router.templatesToggle = !Router.templatesToggle;

        this.$templateToggleButton.toggleClass('active', Router.templatesToggle);

        addon.port.emit("toggleTemplate", Router.templatesToggle);
    }

    /**
     * @param {Object} event
     * @returns {void}
     */
    create(event) {
        event.preventDefault();

        var createdValue = this.$input.val().trim();

        if (createdValue.length) {
            var bPattern = new PatternModel({
                iUri: createdValue
            });

            bPattern.save();

            this.collection.add(bPattern);

            this.$form[0].reset();
        }
    }

    /**
     * @returns {void}
     */
    addAll() {
        this.collection.each(this.addOne, this);
    }

    /**
     * @param {Backbone.Model} pattern
     * @returns {void}
     */
    addOne(pattern) {
        pattern.set('id', this.collection.iCounter++);

        var view = new PatternView({
            model: pattern
        });

        this.$list.append(view.render().el);
    }
}