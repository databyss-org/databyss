const webpack = require('webpack')
const path = require('path')
const getClientEnvironment = require('../../config/env')

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
  },
  plugins: [new webpack.DefinePlugin(envDefines)],
  resolve: {
    alias: {
      deepmerge$: 'deepmerge/dist/umd.js',
    },
  },
}
