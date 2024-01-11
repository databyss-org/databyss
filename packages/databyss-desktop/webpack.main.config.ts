import type { Configuration } from 'webpack'
import * as webpack from 'webpack'
import getClientEnvironment from '../../config/env'

import { rules } from './webpack.rules'

// Get environment variables to inject into our app.
const env = getClientEnvironment('static://')

export const mainConfig: Configuration = {
  /**
   * This is the main entry point for your application, it's the first file
   * that runs in the main process.
   */
  entry: './packages/databyss-desktop/src/index.ts',
  // Put your normal webpack config below here
  module: {
    rules,
  },
  plugins: [new webpack.DefinePlugin(env.stringified)],
  externals: {
    canvas: 'canvas',
  },
  resolve: {
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.css', '.json'],
  },
}
