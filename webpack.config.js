var webpack = require('webpack')
var VERSION = require('./package.json').version

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
    
    externals: {
        lodash: '_',
        moment: 'moment',
        // util: 'util',
    },
    
    plugins: [
        new webpack.optimize.UglifyJsPlugin({test: /\.min\.js$/}),
        new webpack.SourceMapDevToolPlugin({test: /\.min\.js$/, filename: '[name].js.map'}),
        new webpack.DefinePlugin({VERSION: JSON.stringify(VERSION)}),
    ],
}
