import type { Configuration } from 'webpack'

import { rules } from './webpack.rules'

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
  externals: {
    canvas: 'canvas',
  },
  resolve: {
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.css', '.json'],
  },
}
