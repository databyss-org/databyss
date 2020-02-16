const WebpackDefinePlugin = require('webpack').DefinePlugin
const getClientEnvironment = require('../config/env')

// you can use this file to add your custom webpack plugins, loaders and anything you like.
// This is just the basic way to add additional webpack configurations.
// For more information refer the docs: https://storybook.js.org/configurations/custom-webpack-config

// IMPORTANT
// When you add this file, we won't add the default configurations which is similar
// to "React Create App". This only has babel loader to load JavaScript.

module.exports = async ({ config, mode }) => {
  // `mode` has a value of 'DEVELOPMENT' or 'PRODUCTION'
  // You can change the configuration based on that.
  // 'PRODUCTION' is used when building the static version of storybook.

  const webpack = require('../config/webpack.config.js')(mode.toLowerCase())
  config.module.rules = webpack.module.rules

  // by default, storybook rewrites REACT_APP_ environment vars
  // for more configurability, we customized the `env.js` script to 
  // remove the REACT_APP_ prefix from rewrite targets, so you only have
  // to do `process.env.API_URL` instead of `process.env.REACT_APP_API_URL`
  const env = getClientEnvironment()
  config.plugins.push(new WebpackDefinePlugin(env.stringified))
  config.devtool = 'source-map'
  config.resolve.extensions.push('.ts', '.tsx');
  
  return config
}
