module.exports = api => {
  api.cache(true)

  const presets = ['react-app']
  const plugins = ['@babel/plugin-proposal-export-default-from']

  return {
    presets,
    plugins,
  }
}
