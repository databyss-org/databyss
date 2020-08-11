module.exports = api => {
  api.cache(true)

  const presets = ['@babel/preset-env']
  const plugins = [
    [
      '@babel/plugin-transform-runtime',
      {
        regenerator: true,
      },
    ],
  ]
  const ignore = ['**/node_modules', './view']

  return {
    presets,
    plugins,
    ignore,
  }
}
