const path = require('path')
const moduleConfig = require('../../config/webpack.config.js').module
const nodeExternals = require('webpack-node-externals')

module.exports = {
  entry: path.resolve(__dirname, './src/index.js'),
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'databyss-ui.js',
    library: '',
    libraryTarget: 'commonjs',
  },
  externals: [nodeExternals()],
  module: moduleConfig,
}
