const path = require('path')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const webpackConfig = require('./webpack.config.js')('development')

module.exports = {
  components: path.join(
    __dirname,
    '../packages/databyss-ui/components/**/*.js'
  ),
  ignore: ['**/styles.js', '**/_*.js'],
  webpackConfig: {
    ...webpackConfig,
    plugins: [
      ...webpackConfig.plugins,
      new CopyWebpackPlugin([
        path.join(__dirname, '../packages/databyss-ui/public'),
      ]),
    ],
  },
  context: {
    Content: path.resolve(
      __dirname,
      '../packages/databyss-ui/components/Viewport/Content.js'
    ),
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
