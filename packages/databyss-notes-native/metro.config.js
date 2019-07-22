const path = require('path')
const blacklist = require('metro-config/src/defaults/blacklist')

module.exports = {
  projectRoot: path.resolve(__dirname, './'),
  watchFolders: [path.resolve(__dirname, '../..')],
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: false,
      },
    }),
  },
  resolver: {
    blacklistRE: blacklist([/packages\/.*\/node_modules\/react-native\/.*/]),
  },
}
