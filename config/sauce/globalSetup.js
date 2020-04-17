// to enable, add the following entry to package.json jest.projects array:
// {
//   "displayName": "test-selenium",
//   "testEnvironment": "node",
//   "testMatch": [
//     "<rootDir>/packages/databyss-ui/**/*.seleniumtest.js"
//   ],
//   "moduleFileExtensions": [
//     "js"
//   ],
//   "globalSetup": "<rootDir>/config/sauce/globalSetup.js",
//   "globalTeardown": "<rootDir>/config/sauce/globalTeardown.js"
// }
const { setup } = require('../../scripts/sauce-dev-server')

module.exports = async function globalSetup() {
  if (!process.env.LOCAL_ENV) {
    await setup()
    console.log('SauceDevServer.setup was invoked')
  }
}
