const path = require('path')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const webpackConfig = require('./webpack.config.js')('development')

module.exports = {
  ignore: [
    '**/styles.js',
    '**/defaultProps.js',
    '**/_*.js',
    '**/*.native.js',
    '**/*.ios.js',
    '**/*.android.js',
  ],
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
    Text: path.resolve(
      __dirname,
      '../packages/databyss-ui/primitives/Text/Text.js'
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
  pagePerSection: true,
  sections: [
    {
      name: 'Components',
      components: '../packages/databyss-ui/components/**/*.js',
      exampleMode: 'collapse',
      usageMode: 'collapse',
    },
    {
      name: 'Primitives',
      components: '../packages/databyss-ui/primitives/**/*.js',
      exampleMode: 'collapse',
      usageMode: 'collapse',
    },
    {},
  ],
}
