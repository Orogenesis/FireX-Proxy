'use strict';

import merge from 'webpack-merge'
import firefoxConfig from './webpack.config.firefox.babel'

export default merge(firefoxConfig, {
    mode: 'development',
    devtool: 'cheap-module-source-map'
});
