// inspired by jest-dev-server
// https://github.com/smooth-code/jest-puppeteer/tree/master/packages/jest-dev-server
const SauceConnect = require('./SauceConnect.js')
const ServerProcess = require('./ServerProcess.js')

const servers = []

const setup = () => {
  const proxySetup = new Promise(async resolve => {
    const sauce = new SauceConnect()
    sauce.on('stdout', msg => {
      console.log(msg)
      if (msg.match('Sauce Connect is up')) {
        console.log(
          'Sauce dashboard: https://app.saucelabs.com/dashboard/builds'
        )
        resolve()
      }
    })
    const proc = await sauce.spawnProxy()
    servers.push(proc)
  })
  const storybookSetup = new Promise(resolve => {
    const serverProc = new ServerProcess()
    const proc = serverProc.spawn('yarn storybook:sauce')
    serverProc.on('stdout', msg => {
      if (msg.match('webpack built')) {
        console.log('Storybook URL: http://0.0.0.0:8080')
        resolve()
      }
    })
    servers.push(proc)
  })
  return Promise.all([proxySetup, storybookSetup])
}

const teardown = () => Promise.all(servers.map(server => server.destroy()))

if (require.main === module) {
  setup()
    .then(() => {
      console.log('PROXY READY')
      teardown().then(() => {
        console.log('PROXY DESTROYED')
        process.exit()
      })
    })
    .catch(err => {
      console.error(err)
    })
}

module.exports = { setup, teardown }
