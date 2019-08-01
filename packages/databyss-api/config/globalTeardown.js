const { teardown: teardownDevServer } = require('jest-dev-server')
const { dropDB } = require('./db')

module.exports = async function globalTeardown() {
  await dropDB()
  await teardownDevServer()
  // Your global teardown
  console.log('globalTeardown.js was invoked')
}
