const path = require('path');
const autoprefixer = require('autoprefixer');
const ExtractTextPlugin = require('extract-text-webpack-plugin');


const extractStyles = new ExtractTextPlugin('[name].css');

module.exports = {
    context: path.resolve('src/'), // Needs to be an absolute path
    entry: { 'baybulatov-util': './baybulatov-util.less' },

    output: {
        path: path.resolve('dist/'), // Needs to be an absolute path
        filename: '__ignore__.js',
    },

    module: {
        rules: [
            {
                test: /\.less$/,

                use: extractStyles.extract({
                    use: [
                        { loader: 'raw-loader' }, // Instead of `css-loader` to prevent resolving `url(...)` paths
                        { loader: 'postcss-loader', options: { plugins: [autoprefixer({ browsers: ['last 8 versions'] })] } },
                        { loader: 'less-loader' },
                    ],
                }),
            },
        ],
    },

    plugins: [ extractStyles ],
};
