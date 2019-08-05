const path = require('path')
const blacklist = require('metro-config/src/defaults/blacklist')

const workspaceRoot = path.resolve(__dirname, '../..')
const buildRE = new RegExp(`${workspaceRoot}/build/.*`)

module.exports = {
  projectRoot: path.resolve(__dirname, './'),
  watchFolders: [workspaceRoot],
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: false,
      },
    }),
  },
  resolver: {
    blacklistRE: blacklist([
      /packages\/.*\/node_modules\/react-native\/.*/,
      buildRE,
    ]),
  },
}
