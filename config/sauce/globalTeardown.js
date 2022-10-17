// const fetch = require('node-fetch')
const { teardown } = require('../../scripts/sauce-dev-server')

module.exports = async function globalSetup() {
  if (!process.env.LOCAL_ENV) {
    // clears cloudant database

    // await fetch(`http://0.0.0.0:5050/api/cloudant/`, {
    //   method: 'DELETE',
    // })
    await teardown()
    console.log('SauceDevServer.teardown was invoked')
  }
}
