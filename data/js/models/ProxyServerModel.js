var FireX = FireX || {};
console.error("ProxyServerModel");
FireX.ProxyServerModel = Backbone.Model.extend({
        defaults: {
            ip: '127.0.0.1',
            port: '8000',
            type: 'HTTP',
            country: 'United States'
        }
    }
);