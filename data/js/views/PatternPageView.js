var FireX = FireX || {};

$(function () {
    FireX.PatternPageView = Backbone.View.extend({
        id: 'pattern',
        template: _.template($('#pattern-page-template').html()),
        events: {
            'submit #new-entry': 'create',
            'click .checkbox-square': 'toggleTemplates'
        },
        initialize: function () {
            this.listenTo(FireX.Patterns, 'add', this.addOne);
            this.listenTo(FireX.Patterns, 'reset', this.addAll);

            FireX.templatesToggle || (FireX.templatesToggle = false);

            if (!FireX.Patterns.length) {
                FireX.Patterns.fetch();
            }
        },
        render: function () {
            this.$el.html(this.template());

            this.list   = this.$('.h-max');
            this.input  = this.$('input[name=address]');
            this.form   = this.$('#new-entry');
            this.templateToggleButton = this.$('.checkbox-square');

            if (FireX.templatesToggle) {
                this.templateToggleButton.addClass('active');
            }

            if (FireX.Patterns.length) {
                FireX.Patterns.each(this.addOne, this);
            }

            return this;
        },
        toggleTemplates: function () {
            FireX.templatesToggle = !FireX.templatesToggle;

            this.templateToggleButton.toggleClass('active', FireX.templatesToggle);

            addon.port.emit("toggleTemplate", FireX.templatesToggle);
        },
        create: function (event) {
            event.preventDefault();

            if (this.input.val().trim()) {

                FireX.Patterns.create(this.newPattern());
                this.form[0].reset();
            }
        },
        addAll: function () {
            FireX.Patterns.each(this.addOne, this);
        },
        addOne: function (pattern) {
            var view = new FireX.PatternView({
                model: pattern
            });

            this.list.append(view.render().el);
        },
        newPattern: function () {
            return {
                iUri: this.input.val().trim()
            }
        }
    });
});