import merge from 'webpack-merge'
import { resolve, base } from './webpack.config.base.babel'
import ZipPlugin from 'zip-webpack-plugin'
import CopyWebpackPlugin from 'copy-webpack-plugin'

export default merge(base, {
    plugins: [
        new CopyWebpackPlugin([{
            from: 'manifest.chrome.json',
            to: 'manifest.json'
        }]),
        new ZipPlugin({
            path: resolve('dist'),
            filename: 'firex-proxy-chrome',
            extension: 'zip'
        }),
    ]
});
