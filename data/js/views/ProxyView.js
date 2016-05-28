var FireX = FireX || {};

$(function () {
    FireX.ProxyView = Backbone.View.extend({
        tagName: 'tr',
        template: _.template($('#server-template').html()),
        events: {
            'click': 'toggleActive'
        },
        initialize: function () {
            this.listenTo(this.model, 'change', this.render);
        },
        render: function () {
            this.$el.html(this.template(this.model.toJSON())).toggleClass('active', this.model.get('iActive'));

            return this;
        },
        toggleActive: function () {
            _.each(FireX.proxyList.without(this.model), (function (proxy) {
                proxy.set({
                    iActive: false
                })
            }));

            if (this.model.toggle()) {
                addon.port.emit("connect", this.model.toJSON());
            } else {
                addon.port.emit("disconnect");
            }
        }
    });
});