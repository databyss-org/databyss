const path = require('path')
const moduleConfig = require('../../config/webpack.config.js')('production')
  .module
const nodeExternals = require('webpack-node-externals')

module.exports = {
  stats: {
    maxModules: 200,
  },
  entry: path.resolve(__dirname, './index.js'),
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'databyss-ui.js',
    library: '',
    libraryTarget: 'commonjs',
  },
  externals: [nodeExternals()],

  module: moduleConfig,
}
