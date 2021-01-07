const { teardown } = require('../../scripts/sauce-dev-server')
const fetch = require('node-fetch')

module.exports = async function globalSetup() {
  if (!process.env.LOCAL_ENV) {
    await fetch(`${process.env.REACT_APP_API_URL}/cloudant`, {
      method: 'DELETE',
    })
    console.log('cloudant has been cleared')
    await teardown()
    console.log('SauceDevServer.teardown was invoked')
  }
}
