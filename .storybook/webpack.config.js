// you can use this file to add your custom webpack plugins, loaders and anything you like.
// This is just the basic way to add additional webpack configurations.
// For more information refer the docs: https://storybook.js.org/configurations/custom-webpack-config

// IMPORTANT
// When you add this file, we won't add the default configurations which is similar
// to "React Create App". This only has babel loader to load JavaScript.

// const appWebpackConfig = require('../config/webpack.config.dev.js')

const paths = require('../config/paths')

module.exports = {
  plugins: [
    // your custom plugins
  ],
  module: {
    rules: [
      // Process application JS with Babel.
      // The preset includes JSX, Flow, TypeScript, and some ESnext features.
      {
        test: /\.(js|mjs|jsx)$/,
        include: paths.appSrc,
        loader: require.resolve('babel-loader'),
        options: {
          plugins: [
            [
              require.resolve('babel-plugin-react-native-web'),
              {
                commonjs: true,
              },
            ],
          ],
        },
      },
      {
        test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/],
        loader: require.resolve('url-loader'),
        options: {
          limit: 10000,
          name: 'static/media/[name].[hash:8].[ext]',
        },
      },
      {
        test: /\.svg$/,
        use: [
          {
            loader: require.resolve('babel-loader'),
          },
          {
            loader: require.resolve('react-svg-loader'),
            options: {
              jsx: true, // true outputs JSX tags
            },
          },
        ],
      },
    ],
  },
}
