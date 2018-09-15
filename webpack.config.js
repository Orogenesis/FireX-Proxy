'use strict';

const { VueLoaderPlugin } = require('vue-loader');
const path = require('path');

const resolve = (...paths) => path.join(__dirname, ...paths);

module.exports = {
    entry: [
        './vue/browser-action.js'
    ],
    output: {
        path: resolve('dist'),
        filename : '[name].js',
    },
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
