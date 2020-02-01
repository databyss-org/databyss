// const webpack = require('webpack')
const path = require('path')
const nodeExternals = require('webpack-node-externals')
// const UglifyJSPlugin = require('uglifyjs-webpack-plugin')

module.exports = {
  target: 'node',
  entry: {
    app: path.resolve(__dirname, './server.js'),
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, '../../build/api'),
    library: '',
    libraryTarget: 'commonjs',
  },
  externals: [nodeExternals()],
  plugins: [
    // new webpack.LoaderOptionsPlugin({
    //     minimize: true,
    //     debug: false
    // }),
    // new UglifyJSPlugin({
    //     uglifyOptions: {
    //         beautify: false,
    //         ecma: 6,
    //         compress: true,
    //         comments: false
    //     }
    // }),
  ],
}
