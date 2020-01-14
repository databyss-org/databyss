require('../config/env')
const path = require('path')
const fs = require('fs')
const download = require('download')
const os = require('os')
const ServerProcess = require('./ServerProcess')

const IS_CI =
  process.env.CI &&
  (typeof process.env.CI !== 'string' ||
    process.env.CI.toLowerCase() !== 'false')

const ARCHIVE_FILENAME = IS_CI ? 'sc-4.5.4-linux.tar.gz' : 'sc-4.5.4-osx.zip'
const ARCHIVE_DIRNAME = ARCHIVE_FILENAME.replace(/\.zip|\.tar\.gz/, '')
const ARCHIVE_PATH = `${os.tmpdir()}/${ARCHIVE_FILENAME}`
const EXTRACTED_PATH = `${os.tmpdir()}/${ARCHIVE_DIRNAME}`
const UNARCHIVE_CMD = IS_CI
  ? `tar -xvzf ${ARCHIVE_PATH} -C ${os.tmpdir()}`
  : `unzip ${ARCHIVE_PATH} -d ${os.tmpdir()}`

class SauceConnect extends ServerProcess {
  async startProxy(run = this.exec) {
    const binPath = path.join(__dirname, 'bin/sc')
    const configPath = path.join(__dirname, '../config/sauce/sauceconnect.yml')
    if (!fs.existsSync(binPath)) {
      await this.downloadBinary()
    }
    const cmd = `${binPath} -u ${process.env.SAUCE_USERNAME} -k ${
      process.env.SAUCE_ACCESS_KEY
    } --config-file ${configPath}`
    console.log('SauceConnect.startProxy', cmd)
    return run(cmd)
  }
  spawnProxy() {
    return this.startProxy(this.spawn)
  }
  async downloadBinary() {
    console.log('Downloading Sauce Connect binary, please wait...')

    if (!fs.existsSync(ARCHIVE_PATH)) {
      await download(
        `https://saucelabs.com/downloads/${ARCHIVE_FILENAME}`,
        os.tmpdir()
      )
    }
    if (!fs.existsSync(EXTRACTED_PATH)) {
      await this.exec(UNARCHIVE_CMD)
    }
    if (!fs.existsSync(`${__dirname}/bin`)) {
      await this.exec(`mkdir ${__dirname}/bin`)
    }
    await this.exec(`cp ${EXTRACTED_PATH}/bin/sc ${__dirname}/bin/sc`)
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
    }
  })
  job.on('stderr', msg => {
    console.error(msg)
  })
  job.startProxy()
}

module.exports = SauceConnect
