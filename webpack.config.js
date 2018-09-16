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
            },
            {
                test: /\.scss$/,
                use: [
                    'vue-style-loader',
                    'css-loader',
                    {
                        loader: 'sass-loader',
                        options: {
                            data: '@import "variables";',
                            includePaths: [
                                resolve('vue','scss'),
                                resolve('vue')
                            ]
                        }
                    }
                ]
            },
            {
                test: /\.svg$/,
                loader: 'svg-url-loader'
            }
        ]
    },
    resolve: {
        alias: {
            '@': resolve('vue'),
            '$vendor': resolve('node_modules')
        }
    },
    plugins: [
        new VueLoaderPlugin()
    ]
};
