const { setup } = require('../../scripts/sauce-dev-server')
module.exports = async function globalSetup() {
  if (!process.env.LOCAL_ENV) {
    await setup()
    console.log('SauceDevServer.setup was invoked')
  }
}
