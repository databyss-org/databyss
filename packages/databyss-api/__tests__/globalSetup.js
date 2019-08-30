const { setup: setupDevServer } = require('jest-dev-server')
const { dropTestDB } = require('../lib/db')

module.exports = async function globalSetup() {
  await dropTestDB()
  await setupDevServer({
    command: `${
      process.env.BABEL_ENV ? '' : 'cd ./../../ && '
    } yarn start:server`,
    launchTimeout: 50000,
  })

  // Your global setup
  console.log('globalSetup.js was invoked')
}
