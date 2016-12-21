var webpack = require('webpack')

if (~process.argv.indexOf('--add-version'))
    var VERSION = timestamp()

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

function timestamp() {
    var d = new Date()
    var isoDate = [d.getFullYear(), pad(d.getMonth() + 1), pad(d.getDate())].join('-')
    var isoTime = [pad(d.getHours()), pad(d.getMinutes()), pad(d.getSeconds())].join(':')
    return isoDate + 'T' + isoTime
    function pad(n) {return n < 10 ? '0' + n : n}
}
