var FireX = FireX || {};

$(function () {
    FireX.ListView = Backbone.View.extend({
        el: '#proxy-content',
        events: {
            'click .refresh': 'update'
        },
        initialize: function () {
            var that = this;

            addon.port.on('onList', function (response) {
                that.onList(response);
            }).on('onMenuOpen', function () {
                that.onMenuOpen();
            });

            this.table = this.$('#proxy-list-box');

            this.listenTo(FireX.proxyList, 'add', this.addOne);
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