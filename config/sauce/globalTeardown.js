const { teardown } = require('../../scripts/sauce-dev-server')
const fetch = require('node-fetch')

module.exports = async function globalSetup() {
  if (!process.env.LOCAL_ENV) {
    await fetch(`http://localhost:5000/api/cloudant`, {
      method: 'DELETE',
    })
    console.log('cloudant has been cleared')
    await teardown()
    console.log('SauceDevServer.teardown was invoked')
  }
}
