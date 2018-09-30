const path = require('path')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const webpackConfig = require('./webpack.config.dev.js')

module.exports = {
  components: path.join(
    __dirname,
    '../packages/databyss-ui/src/components/**/*.js'
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
      '../packages/databyss-ui/src/components/Viewport/Viewport'
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
