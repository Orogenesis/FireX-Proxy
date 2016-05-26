var FireX = FireX || {};

$(function () {
    FireX.ListView = Backbone.View.extend({
        template: _.template($('#list-template').html()),
        events: {
            'click .refresh': 'update'
        },
        initialize: function () {
            this.listenTo(FireX.proxyList, 'add', this.addOne);

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

            if(FireX.proxyList.length) this.addAll();
            
            return this;
        },
        onMenuOpen: function () {
            if (!FireX.proxyList.length) {
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

            FireX.proxyList.each(this.addOne, this);
        },
        onList: function (proxyList) {
            FireX.proxyList.reset();

            this.table.removeClass('spinner');

            (function (that) {
                proxyList.forEach(function (item, i) {
                    FireX.proxyList.create(that.addressToModel(item));
                });
            })(this);
        },
        addressToModel: function (address) {
            return {
                iAddress: address.ipAddress,
                iPort: address.port,
                iProtocol: address.protocol,
                iCountry: address.country
            }
        }
    });
});