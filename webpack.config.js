const webpack = require('webpack');
const path = require('path');

module.exports = (env, argv) => ({
    entry: './client/index.ts',
    mode: argv.mode || 'production',
    devtool: false,
    plugins: [new webpack.SourceMapDevToolPlugin({})],
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
        ],
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
    },
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'public'),
    },
});