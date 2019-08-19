module.exports = api => {
  api.cache(true)

  const presets = [
    'react-app',
    'module:metro-react-native-babel-preset',
    '@emotion/babel-preset-css-prop',
  ]
  const plugins = ['emotion']

  return {
    presets,
    plugins,
  }
}
