var FireX = FireX || {};

$(function () {
    FireX.ListView = Backbone.View.extend({
        template: _.template($('#list-template').html()),
        events: {
            'click .refresh': 'update'
        },
        initialize: function () {
            this.listenTo(FireX.ProxyList, 'add', this.addOne);

            var that = this;

            addon.port.on('onList', function (response) {
                that.onList(response);
            }).on('onMenuOpen', function () {
                that.onMenuOpen();
            });

        },
        render: function () {
            this.$el.html(this.template());

            this.table = this.$('#proxy-list-box');

            if (FireX.ProxyList.length) {
                this.addAll();
            }

            return this;
        },
        onMenuOpen: function () {
            if (!FireX.ProxyList.length) {
                this.update();
            }
        },
        update: function () {
            addon.port.emit('getList');

            this.table.addClass('spinner').empty();
        },
        addOne: function (proxy) {
            var view = new FireX.ProxyView({
                model: proxy
            });

            this.table.append(view.render().el);
        },
        addAll: function () {
            this.table.empty();

            FireX.ProxyList.each(this.addOne, this);
        },
        onList: function (list) {
            FireX.ProxyList.reset();

            this.table.removeClass('spinner');

            (function (that) {
                _.each(list, function (value) {
                    FireX.ProxyList.create(that.addressToModel(value));
                });
            })(this);
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