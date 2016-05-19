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
            this.spinner = this.$('#loading-gif');

            this.listenTo(FireX.proxyList, 'add', this.addOne);
        },
        onMenuOpen: function () {
            if (!FireX.proxyList.length) {
                this.update();
            }
        },
        update: function () {
            addon.port.emit('getList');

            this.table.empty();
            this.spinner.show();
        },
        addOne: function (proxy) {
            var view = new FireX.ProxyView({
                model: proxy
            });

            this.table.append(view.render().el);
        },
        onList: function (proxyList) {
            FireX.proxyList.reset();

            this.spinner.hide();

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