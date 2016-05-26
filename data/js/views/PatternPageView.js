var FireX = FireX || {};

$(function () {
    FireX.PatternPageView = Backbone.View.extend({
        tagName: 'div',
        attributes: {
            'id':'pattern'
        },
        template: _.template($('#pattern-page-template').html()),
        events: {
            'submit #new-entry': 'create'
        },
        initialize: function () {
            this.listenTo(FireX.patterns, 'add', this.addOne);

            FireX.patterns.fetch();
        },
        render: function () {
            this.$el.html(this.template());

            this.list = this.$('.h-max');
            this.input = this.$('input[name=address]');
            this.form = this.$('#new-entry');

            if(FireX.patterns.length) {
                FireX.patterns.each(this.addOne, this);
            }

            return this;
        },
        create: function (e) {
            e.preventDefault();

            if(this.input.val().trim()) {

                FireX.patterns.create(this.newPattern());
                this.form[0].reset();
            }
        },
        addOne: function (pattern) {
            var view = new FireX.PatternView({
                model: pattern
            });

            this.list.append(view.render().el);
        },
        newPattern: function () {
            return {
                iString: this.input.val().trim()
            }
        }
    });
});