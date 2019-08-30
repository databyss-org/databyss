const { teardown: teardownDevServer } = require('jest-dev-server')

module.exports = async function globalTeardown() {
  await teardownDevServer()
  // Your global teardown
  console.log('globalTeardown.js was invoked')
}
