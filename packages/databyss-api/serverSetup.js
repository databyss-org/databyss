const {
  setup: setupDevServer,
  teardown: teardownDevServer,
} = require('jest-dev-server')
// const { dropDB } = require('./config/db')

async function globalSetup() {
  await setupDevServer({
    command: 'yarn start',
    launchTimeout: 50000,
  })
  console.log('Server Started...')
  // Your global setup
}

async function globalTeardown() {
  await teardownDevServer()
  console.log('Server Closed...')
}

module.exports = { globalSetup, globalTeardown }
