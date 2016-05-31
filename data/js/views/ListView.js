var FireX = FireX || {};

$(function () {
    FireX.ListView = Backbone.View.extend({
        template: _.template($('#list-template').html()),
        events: {
            'click .refresh':   'update',
            'click .h-manage':  'toggleFavorites'
        },
        initialize: function () {
            this.listenTo(FireX.ProxyList, 'add', this.onAdd);
            this.listenTo(FireX.ProxyList, 'change', this.render);

            this.listenTo(FireX.FavoriteServers, 'reset', this.onReset);
            this.listenTo(FireX.FavoriteServers, 'change', this.render);


            var that = this;
            FireX.listMode || (FireX.listMode = false); // false - default proxy list. true - favorite proxy list

            addon.port.on('onList', function (response) {
                that.onList(response);
            }).on('onMenuOpen', function () {
                that.onMenuOpen();
            });

            if (!FireX.FavoriteServers.length) {
                FireX.FavoriteServers.fetch();
            }
        },
        render: function () {
            this.$el.html(this.template());

            this.table = this.$('#proxy-list-box');
            this.$('.checkbox-square').toggleClass('active', FireX.listMode);
            
            this.addAll((FireX.listMode) ? FireX.FavoriteServers : FireX.ProxyList);

            return this;
        },
        onMenuOpen: function () {
            if (!FireX.ProxyList.length) {
                this.update();
            }
        },
        update: function () {
            addon.port.emit('getList');

            FireX.ProxyList.reset();
            FireX.listMode = false;
            this.render();

            if (this.table) {
                this.table.addClass('spinner').empty();
            }
        },
        addOne: function (proxy) {
            var view = new FireX.ProxyView({
                model: proxy
            });

            this.table.append(view.render().el);
        },
        addAll: function (from) {
            this.table.empty();

            from.each(this.addOne, this);
        },
        onAdd: function (proxy) {
            if (!FireX.listMode) {
                this.addOne(proxy);
            }
        },
        onReset: function () {
            if (FireX.listMode) {
                this.addAll(FireX.FavoriteServers);
            }
        },
        onList: function (list) {
            FireX.ProxyList.reset();

            if (this.table) {
                this.table.removeClass('spinner');
            }

            (function (that) {
                _.each(list, function (value) {
                    FireX.ProxyList.create(that.addressToModel(value));
                });
            })(this);
        },
        toggleFavorites: function () {
            FireX.listMode = !FireX.listMode;
            this.render();
        },
        addressToModel: function (address) {
            return {
                iAddress: address.ipAddress,
                iPort: address.port,
                iProtocol: address.originalProtocol,
                iCountry: address.country
            }
        }
    });
});