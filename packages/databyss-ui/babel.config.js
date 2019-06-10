module.exports = api => {
  api.cache(true)

  const presets = ['react-app']
  const plugins = []

  return {
    presets,
    plugins,
  }
}
