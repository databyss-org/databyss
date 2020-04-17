// to enable, add the following entry to package.json jest.projects array:
// {
//   "displayName": "checkversion",
//   "runner": "./tests/checkversion.runner.js",
//   "testMatch": [
//     "<rootDir>/**/package.json"
//   ],
//   "testPathIgnorePatterns": [
//     "/node_modules/",
//     "/build/"
//   ]
// }
const { createJestRunner } = require('create-jest-runner')

module.exports = createJestRunner(require.resolve('./checkversion.run'))
