const { teardown: teardownDevServer } = require('jest-dev-server')
const fetch = require('node-fetch')

module.exports = async function globalTeardown() {
  // clears cloudant database
  await fetch(`${process.env.REACT_APP_API_URL}/cloudant`, {
    method: 'DELETE',
  })
  console.log('DATABASE CLEARED')
  await teardownDevServer()
  // Your global teardown
  console.log('globalTeardown.js was invoked')
}
