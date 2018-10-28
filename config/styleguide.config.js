const path = require('path')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const webpackConfig = require('./webpack.config.js')

module.exports = {
  components: path.join(
    __dirname,
    '../packages/databyss-ui/components/**/*.js'
  ),
  webpackConfig: {
    ...webpackConfig,
    plugins: [
      ...webpackConfig.plugins,
      new CopyWebpackPlugin([
        path.join(__dirname, '../packages/databyss-ui/public'),
      ]),
    ],
  },
  skipComponentsWithoutExample: true,
  styleguideDir: path.join(__dirname, '../build'),
  styleguideComponents: {
    Wrapper: path.join(
      __dirname,
      '../packages/databyss-ui/components/Viewport/ThemedViewport'
    ),
  },
  styles: {
    Playground: {
      preview: {
        padding: 5,
      },
    },
  },
  template: {
    title: 'extended-usage',
    favicon: '/favicon.ico',
    head: {
      links: [
        {
          rel: 'stylesheet',
          type: 'text/css',
          href: '/fonts.css',
        },
      ],
    },
  },
  title: 'Databyss Component Library',
}
