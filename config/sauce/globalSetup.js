const { setup } = require('../../scripts/sauce-dev-server')

module.exports = async function globalSetup() {
  await setup()
  console.log('SauceDevServer.setup was invoked')
}
