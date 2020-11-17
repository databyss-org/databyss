const { getDefaultConfig } = require('metro-config')
const path = require('path')
const blacklist = require('metro-config/src/defaults/blacklist')

const workspaceRoot = path.resolve(__dirname, '../..')
const buildRE = new RegExp(`${workspaceRoot}/build/.*`)

module.exports = (async () => {
  const {
    resolver: { sourceExts, assetExts },
  } = await getDefaultConfig()
  return {
    projectRoot: path.resolve(__dirname, './'),
    watchFolders: [workspaceRoot],
    transformer: {
      babelTransformerPath: require.resolve('react-native-svg-transformer'),
      getTransformOptions: async () => ({
        transform: {
          experimentalImportSupport: false,
          inlineRequires: false,
        },
      }),
    },
    resolver: {
      assetExts: assetExts.filter((ext) => ext !== 'svg'),
      sourceExts: [...sourceExts, 'svg'],
      blacklistRE: blacklist([
        /packages\/.*\/node_modules\/react-native\/.*/,
        buildRE,
      ]),
    },
  }
})()
