require('../config/env')
const path = require('path')
const fs = require('fs')
const download = require('download')
const os = require('os')
const ServerProcess = require('./ServerProcess')

class SauceConnect extends ServerProcess {
  async startProxy() {
    const binPath = path.join(__dirname, 'bin/sc')
    const configPath = path.join(__dirname, '../config/sauceconnect.yml')
    if (!fs.existsSync(binPath)) {
      await this.downloadBinary()
    }
    await this.exec(
      `${binPath} -u ${process.env.SAUCE_USERNAME} -k ${
        process.env.SAUCE_ACCESS_KEY
      } --config-file ${configPath}`
    )
  }
  async runTests() {
    console.log('Starting Jest test runner...')
    await this.exec(`yarn test:selenium`)
  }
  async downloadBinary() {
    console.log('Downloading Sauce Connect binary, please wait...')
    await download(
      'https://saucelabs.com/downloads/sc-4.5.4-osx.zip',
      os.tmpdir()
    )
    await this.exec(`unzip ${os.tmpdir()}/sc-4.5.4-osx.zip -d ${os.tmpdir()}`)
    if (!fs.existsSync(`${__dirname}/bin`)) {
      await this.exec(`mkdir ${__dirname}/bin`)
    }
    await this.exec(`cp ${os.tmpdir()}/sc-4.5.4-osx/bin/sc ${__dirname}/bin/sc`)
  }
}

if (require.main === module) {
  const job = new SauceConnect()
  job.on('end', () => {
    process.exit()
  })
  job.on('stdout', msg => {
    console.log(msg)
    if (msg.match('Sauce Connect is up')) {
      console.log('Sauce dashboard: https://app.saucelabs.com/dashboard/builds')
      job.runTests()
    }
  })
  job.on('stderr', msg => {
    console.error(msg)
  })
  job.startProxy()
}
