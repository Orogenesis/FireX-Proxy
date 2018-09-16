const merge = require('webpack-merge');
const defaultConfig = require('./webpack.config.js');

module.exports = merge(defaultConfig, {
    mode: 'development',
    devtool: 'cheap-module-source-map'
});