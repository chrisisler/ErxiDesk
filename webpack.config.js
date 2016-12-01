// const ExtractTextPlugin = require('extract-text-webpack-plugin');

const isProd = process.env.NODE_ENV === 'production';

module.exports =
{
    context: __dirname + '/app',
    entry: './js/client.js',
    output:
    {
        path: __dirname + '/app/',
        filename: 'client.min.js'
    },
    devtool: isProd ? null : 'inline-sourcemap',
    module:
    {
        loaders:
        [
            {
                test: /\.js?$/,
                exclude: /node_modules/,
                loader: 'babel-loader',
                query:
                {
                    presets:
                    [
                        'es2015',
                        'react'
                    ]
                }
            }
        ]
    }
};

