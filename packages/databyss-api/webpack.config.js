const webpack = require('webpack')
const path = require('path')
const { BugsnagSourceMapUploaderPlugin } = require('webpack-bugsnag-plugins')
const CopyWebpackPlugin = require('copy-webpack-plugin')
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
    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.resolve(
            __dirname,
            '../databyss-data/cloudant/_design_doc_includes'
          ),
          to: path.resolve(__dirname, '../../build/api/_design_doc_includes'),
        },
      ],
    }),
  ].filter(Boolean),
  resolve: {
    extensions: ['.js', '.ts', '.json'],
    alias: {
      deepmerge$: 'deepmerge/dist/umd.js',
      'isomorphic-fetch': 'cross-fetch/polyfill',
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
            plugins: ['@babel/plugin-proposal-class-properties'],
          },
        },
      },
    ],
  },
}
