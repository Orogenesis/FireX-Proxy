'use strict';

const { VueLoaderPlugin } = require('vue-loader');

module.exports = {
    entry: [
        './vue/browser-action.js'
    ],
    module: {
        rules: [
            {
                test: /\.vue$/,
                use: 'vue-loader'
            }
        ]
    },
    plugins: [
        new VueLoaderPlugin()
    ]
};
