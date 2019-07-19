const path = require('path')
const moduleConfig = require('../../config/webpack.config.js')('production')
  .module
const nodeExternals = require('webpack-node-externals')

module.exports = {
  entry: path.resolve(__dirname, './index.js'),
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'databyss-ui.js',
    library: '',
    libraryTarget: 'commonjs',
  },
  externals: [
    nodeExternals({
      whitelist: [
        // must be bundled because the aliasing needs to happen in the library
        //  (the consumer may not know about it)
        'react-native',
        // HACK: I don't know why this needs to be bundled, but consumer
        //   won't build without it
        'emotion-theming',
      ],
    }),
  ],
  resolve: {
    alias: {
      // Support React Native Web
      // https://www.smashingmagazine.com/2016/08/a-glimpse-into-the-future-with-react-native-for-web/
      'react-native': 'react-native-web',
    },
  },
  module: moduleConfig,
}
