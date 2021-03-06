module.exports =
{
    context: __dirname + '/src',
    entry: './index.js',
    module:
    {
        loaders:
        [
            {
                test: /\.jsx?$/,
                exclude: /node_modules/,
                loader: 'babel-loader',
                query:
                {
                    presets: [ 'react', 'es2015' ]
                }
            }
        ]
    },
    output:
    {
        path: __dirname + '/src',
        filename: 'index.min.js'
    },
    plugins: [],
    target: 'electron'
};

