const webpack = require('webpack')
const path = require('path')
const { BugsnagSourceMapUploaderPlugin } = require('webpack-bugsnag-plugins')
const getClientEnvironment = require('../../config/env')

const env = getClientEnvironment()
const envDefines = Object.keys(env.raw).reduce((accum, key) => {
  if (env.raw[key]) {
    accum[`process.env.${key}`] = `'${env.raw[key]}'`
  }
  return accum
}, {})

module.exports = {
  target: 'node',
  devtool: 'source-map',
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
  },
  plugins: [
    new webpack.DefinePlugin(envDefines),
    process.env.API_BUGSNAG_KEY &&
      new BugsnagSourceMapUploaderPlugin({
        apiKey: process.env.API_BUGSNAG_KEY,
        publicPath: 'build/api',
        overwrite: true,
      }),
  ].filter(Boolean),
  resolve: {
    extensions: ['.js', '.ts'],
    alias: {
      deepmerge$: 'deepmerge/dist/umd.js',
    },
  },
  module: {
    rules: [
      {
        test: /\.(js|ts)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
          },
        },
      },
    ],
  },
}
