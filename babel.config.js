module.exports = api => {
  api.cache(true)

  const presets = ['react-app']
  const plugins = ['emotion']

  return {
    presets,
    plugins,
  }
}
