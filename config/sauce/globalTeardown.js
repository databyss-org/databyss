const { teardown } = require('../../scripts/sauce-dev-server')

module.exports = async function globalSetup() {
  if (!process.env.LOCAL_ENV) {
    await teardown()
    console.log('SauceDevServer.teardown was invoked')
  }
}
