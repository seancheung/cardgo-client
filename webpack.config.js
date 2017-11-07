const path = require('path');
const webpack = require('webpack');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    entry: {
        main: './src/index.js',
        vendor: ['pixi.js', 'socket.io-client']
    },
    output: {
        filename: '[name].js?[chunkhash]',
        path: path.resolve(__dirname, 'www')
    },
    module: {
        rules: [
            { test: /\.js$/, use: 'babel-loader', exclude: /node_modules/ },
            {
                test: /\.(png|json|mp3)$/,
                use: [
                    {
                        loader: 'file-loader',
                        options: { name: 'assets/[name].[ext]?[hash]' }
                    }
                ]
            }
        ]
    },
    resolve: {
        alias: {
            res: path.resolve(__dirname, 'res/assets'),
            '@': path.resolve(__dirname, 'src/components')
        }
    },
    plugins: [
        new CleanWebpackPlugin(['www/*'], { exclude: ['.gitignore'] }),
        new HtmlWebpackPlugin({
            title: 'CardGo',
            template: './res/index.html'
        }),
        new webpack.HashedModuleIdsPlugin(),
        new webpack.optimize.CommonsChunkPlugin({ name: 'vendor' })
    ]
};
