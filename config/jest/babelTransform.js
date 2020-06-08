const babelOptions = require('../../babel.config')({
  cache: () => {},
  env: () => process.env.NODE_ENV,
})

babelOptions.plugins = [
  ...babelOptions.plugins,
  'require-context-hook',
  'react-native-web',
  [
    'module-resolver',
    {
      alias: {
        slate: '@databyss-org/slate',
      },
    },
  ],
]

module.exports = require('babel-jest').createTransformer(babelOptions)
