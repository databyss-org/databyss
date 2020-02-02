const webpack = require('webpack')
const path = require('path')
// const TerserPlugin = require('terser-webpack-plugin')
// const InterpolateHtmlPlugin = require('react-dev-utils/InterpolateHtmlPlugin')
// const HtmlWebpackPlugin = require('html-webpack-plugin')
const getClientEnvironment = require('../../config/env')
// const UglifyJSPlugin = require('uglifyjs-webpack-plugin')

const env = getClientEnvironment()
const envDefines = Object.keys(env.raw).reduce((accum, key) => {
  if (env.raw[key]) {
    accum[`process.env.${key}`] = `'${env.raw[key]}'`
  }
  return accum
}, {})
console.log('ENV', envDefines)

module.exports = {
  target: 'node',
  entry: {
    app: path.resolve(__dirname, './src/app.js'),
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, '../../build/api'),
    library: '',
    libraryTarget: 'commonjs',
  },
  optimization: {
    minimize: false,
    // minimizer: [new TerserPlugin()],
  },
  // externals: [nodeExternals()],
  plugins: [new webpack.DefinePlugin(envDefines)],
}
