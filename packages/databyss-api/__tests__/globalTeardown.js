const { teardown: teardownDevServer } = require('jest-dev-server')
const fetch = require('node-fetch')

module.exports = async function globalTeardown() {
  // clears cloudant database
  await fetch(`http://0.0.0.0:5050/api/cloudant/`, {
    method: 'DELETE',
  })
  // console.log('cloudant databse cleared')
  await teardownDevServer()
  // Your global teardown
  console.log('globalTeardown.js was invoked')
}
