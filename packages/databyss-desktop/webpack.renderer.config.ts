import type { Configuration } from 'webpack'

import { rules } from './webpack.rules'
import { plugins } from './webpack.plugins'

rules.push({
  test: /\.css$/,
  use: [{ loader: 'style-loader' }, { loader: 'css-loader' }],
})

export const rendererConfig: Configuration = {
  module: {
    rules,
  },
  plugins,
  resolve: {
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.css'],
    fallback: {
      stream: require.resolve('stream-browserify'),
      crypto: false,
      path: false,
      process: require.resolve('process'),
    },
    alias: {
      slate: '@databyss-org/slate',
    },
  },
}
