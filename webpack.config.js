var webpack = require('webpack')

module.exports = {
    entry: {
        'baybulatov-util': './src/index.js',
        'baybulatov-util.min': './src/index.js',
    },
    
    output: {
        path: './dist',
        filename: '[name].js',
        library: '$$', // Export as a library...
        libraryTarget: 'var', // ...to a root scope variable
    },
    
    module: {
        loaders: [
            {test: /\.json$/, loader: 'json'},
        ],
    },
    
    externals: {
        lodash: '_',
        moment: 'moment',
    },
    
    plugins: [
        new webpack.optimize.UglifyJsPlugin({test: /\.min\.js$/}),
        new webpack.SourceMapDevToolPlugin({test: /\.min\.js$/, filename: '[name].js.map'}),
        // new webpack.DefinePlugin({VERSION: JSON.stringify(VERSION)}),
    ],
}
