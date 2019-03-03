'use strict';

import merge from 'webpack-merge'
import chromeConfig from './webpack.config.chrome.babel'

export default merge(chromeConfig, {
    mode: 'development',
    devtool: 'cheap-module-source-map'
});
