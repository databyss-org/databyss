// import type IForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin'
import * as webpack from 'webpack'
import getClientEnvironment from '../../config/env'

// // eslint-disable-next-line @typescript-eslint/no-var-requires
// const ForkTsCheckerWebpackPlugin: typeof IForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin')

// Get environment variables to inject into our app.
const env = getClientEnvironment('static://')

export const plugins = [
  new webpack.DefinePlugin(env.stringified),
  new webpack.ProvidePlugin({
    process: 'process/browser',
  }),
  //   new ForkTsCheckerWebpackPlugin({
  //     logger: 'webpack-infrastructure',
  //   }),
]
