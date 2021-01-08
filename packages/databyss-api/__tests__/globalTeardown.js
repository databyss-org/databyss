const { teardown: teardownDevServer } = require('jest-dev-server')
// const fetch = require('node-fetch')

module.exports = async function globalTeardown() {
  // clears cloudant database
  // await fetch(`http://localhost:5000/api/cloudant/cloudant`, {
  //   method: 'DELETE',
  // })
  // console.log('cloudant databse cleared')
  await teardownDevServer()
  // Your global teardown
  console.log('globalTeardown.js was invoked')
}
