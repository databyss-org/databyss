const { teardown } = require('../../scripts/sauce-dev-server')

module.exports = async function globalSetup() {
  await teardown()
  console.log('SauceDevServer.teardown was invoked')
}
