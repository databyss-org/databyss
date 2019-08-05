module.exports = api => {
  api.cache(true)

  const presets = ['@babel/env']
  const plugins = [
    [
      '@babel/plugin-transform-runtime',
      {
        regenerator: true,
      },
    ],
  ]
  const ignore = ['**/node_modules']

  return {
    presets,
    plugins,
    ignore,
  }
}
