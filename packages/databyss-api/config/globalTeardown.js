const { teardown: teardownDevServer } = require('jest-dev-server')
const { dropDB } = require('./db')

module.exports = async function globalTeardown() {
  await teardownDevServer()
  await dropDB()
  // Your global teardown
  console.log('globalTeardown.js was invoked')
}
