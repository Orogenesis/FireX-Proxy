var FireX = FireX || {};

$(function () {
    FireX.ListView = Backbone.View.extend({
        template: _.template($('#list-template').html()),
        events: {
            'click .refresh':    'update',
            'click .h-manage':   'toggleFavorites'
        },
        initialize: function () {
            var that = this;

            this.listenTo(FireX.ProxyList, 'reset', this.addAll);
            this.listenTo(FireX.ProxyList, 'change:iFavorite', function (model, value, options) {
                if (!value) {
                    that.addAll();
                }
            });

            FireX.listMode || (FireX.listMode = false);

            addon.port.on('onList', function (response) {
                that.onList(response);
            }).on('onMenuOpen', function () {
                that.onMenuOpen();
            });

        },
        render: function () {
            this.$el.html(this.template());

            this.table = this.$('#proxy-list-box');
            this.hBox = this.$('.h-box');
            this.favoriteCheckbox = this.$('.checkbox-square');
            this.favoriteCheckbox.toggleClass('active', FireX.listMode);

            this.addAll();

            return this;
        },
        onMenuOpen: function () {
            if (!FireX.ProxyList.length) {
                this.update();
            }
        },
        update: function () {
            addon.port.emit('getList');

            FireX.listMode = false;
            this.favoriteCheckbox.toggleClass('active', FireX.listMode);

            this.hBox.addClass('spinner');
            this.table.empty();
        },
        addOne: function (proxy) {
            var view = new FireX.ProxyView({
                model: proxy
            });

            this.table.append(view.render().el);
        },
        addAll: function () {
            this.table.empty();

            _.each(FireX.ProxyList.where({
                iFavorite: FireX.listMode
            }), this.addOne, this);
        },
        onList: function (list) {
            this.hBox.removeClass('spinner');

            FireX.ProxyList.reset(FireX.ProxyList.where({
                iFavorite: true
            }).concat(list));
        },
        toggleFavorites: function () {
            FireX.listMode = !FireX.listMode;
            this.favoriteCheckbox.toggleClass('active', FireX.listMode);
            this.addAll();
        }
    });
});