import { VueLoaderPlugin } from 'vue-loader';
import CleanWebpackPlugin from 'clean-webpack-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import CopyWebpackPlugin from 'copy-webpack-plugin';
import path from 'path';

export const resolve = (...paths) => path.join(__dirname, ...paths);
export const base = {
    entry: {
        main: resolve('vue', 'browser-action.js'),
        welcome: resolve('welcome', 'welcome.js')
    },
    output: {
        path: resolve('build'),
        filename : '[name].bundle.js',
    },
    module: {
        rules: [
            {
                test: /\.vue$/,
                use: 'vue-loader'
            },
            {
                test: /\.(eot|ttf|woff|woff2)$/,
                loader: 'file-loader?name=public/fonts/[name].[ext]'
            },
            {
                test: /\.css/,
                use: [
                    'vue-style-loader',
                    'css-loader'
                ],
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
                loader: 'svg-url-loader',
                options: {
                    fallback: 'file-loader',
                    limit: 2 * 1024,
                    noquotes: true,
                    outputPath: 'images'
                }
            },
        ]
    },
    resolve: {
        alias: {
            '@': resolve('vue'),
            '$vendor': resolve('node_modules')
        }
    },
    plugins: [
        new CleanWebpackPlugin(["build"]),
        new VueLoaderPlugin(),
        new CopyWebpackPlugin([
            {
                from: "data",
                to: "data"
            },
            {
                from: "_locales",
                to: "_locales"
            },
            {
                from: 'addon',
                to: 'addon'
            },
            {
                from: "background.html"
            },
            {
                from: 'welcome/**.*',
                ignore: ['*.js', '*.html']
            },
            {
                from: 'prompt'
            }
        ]),
        new HtmlWebpackPlugin({
            template: resolve('vue', 'templates', 'browser-action.html'),
            filename: "browser-action.html",
            chunks: ['main']
        }),
        new HtmlWebpackPlugin({
            template: resolve('welcome', 'index.html'),
            filename: 'welcome/index.html',
            chunks: ['welcome']
        })
    ],
    mode: 'production',
};
