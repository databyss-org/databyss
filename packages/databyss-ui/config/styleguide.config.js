const path = require('path')

module.exports = {
  components: path.join(__dirname, '../src/components/**/*.js'),
  webpackConfig: require('./webpack.config.dev.js'),
  skipComponentsWithoutExample: true,
  styleguideDir: 'build',
  styleguideComponents: {
    Wrapper: path.join(__dirname, '../src/components/Viewport/Viewport'),
  },
  styles: {
    Playground: {
      preview: {
        padding: 5,
      },
    },
  },
  template: {
    favicon: 'http://returntocinder.com/favicon.png',
  },
  title: 'Databyss Component Library',
}
