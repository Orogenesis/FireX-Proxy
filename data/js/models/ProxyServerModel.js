var FireX = FireX || {};

$(function () {
    FireX.ProxyServerModel = Backbone.Model.extend({
        defaults: {
            iAddress: '127.0.0.1',
            iPort: '80',
            iProtocol: 'HTTP',
            iCountry: 'UK'
        }
    });
});