const { createJestRunner } = require('create-jest-runner')

module.exports = createJestRunner(require.resolve('./checkversion.run'))
