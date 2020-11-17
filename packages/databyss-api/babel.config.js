module.exports = (api) => {
  api.cache(true)

  const presets = ['@babel/preset-env', '@babel/preset-typescript']
  const plugins = [
    [
      '@babel/plugin-transform-runtime',
      {
        regenerator: true,
      },
    ],
    '@babel/plugin-proposal-class-properties',
  ]
  const ignore = ['**/node_modules']

  return {
    presets,
    plugins,
    ignore,
  }
}
