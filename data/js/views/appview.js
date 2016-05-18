var FireX = FireX || {};
FireX.ListView = Backbone.View.extend({
        el: '#proxy-content',
        initialize: function () {
            console.error("initialize function");
            self.port.on("list-ready", this.data);
            this.table = this.$('#proxy-list-box');
            this.listenTo(FireX.proxyList, 'add', this.addOne);
            this.listenTo(FireX.proxyList, 'reset', this.addAll);
            if (FireX.proxyList.size == 0) this.update();
            FireX.proxyList.fetch();
        },
        events: {'click .refresh': 'update'},
        update: function () {
            console.error("update function");
            self.port.emit("parse-proxy");
        },
        addOne: function (proxy) {
            var view = new FireX.ProxyView({model: FireX.ProxyServer});
            this.table.append(view.render().el);
        },
        addAll: function () {
            this.table.html('');
            FireX.proxyList.each(this.addOne, this);
        },
        data: function (proxyList) {
            FireX.proxyList.reset();
            for (var i = 0; i < proxyList.length; i++) {
                FireX.proxyList.create(this.addressToModel(proxyList[i]));
            }
        },
        addressToModel: function (address) {
            return {
                ip: address.getIPAddress(),
                port: address.getPort(),
                type: address.getProxyProtocol(),
                country: address.getCountry()
            }
        }
    }
);