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
            });

            this.table = this.$('#proxy-list-box');

            this.listenTo(FireX.proxyList, 'add', this.addOne);
            this.listenTo(FireX.proxyList, 'reset', this.addAll);

            if (!FireX.proxyList.size) {
                this.update();
            }

            FireX.proxyList.fetch();
        },
        update: function () {
            addon.port.emit('getList');
        },
        addOne: function (proxy) {
            var view = new FireX.ProxyView({
                model: FireX.ProxyServer
            });

            this.table.append(view.render().el);
        },
        addAll: function () {
            this.table.empty();

            FireX.proxyList.each(this.addOne, this);
        },
        onList: function (proxyList) {
            FireX.proxyList.reset();

            (function (that) {
                proxyList.forEach(function (item, i) {
                    FireX.proxyList.create(that.addressToModel(item));
                });
            })(this);
        },
        addressToModel: function (address) {
            return {
                iAddress:   address.getIPAddress(),
                iPort:      address.getPort(),
                iProtocol:  address.getProxyProtocol(),
                iCountry:   address.getCountry()
            }
        }
    });
});