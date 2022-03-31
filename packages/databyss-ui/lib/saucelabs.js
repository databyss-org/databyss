import webdriver, { Builder } from 'selenium-webdriver'

export const CHROME = 'chrome'
export const FIREFOX = 'firefox'
export const SAFARI = 'safari'
export const WIN = 'Windows 10'
export const OSX = 'OS X 10.15'

const username = process.env.SAUCE_USERNAME
const accessKey = process.env.SAUCE_ACCESS_KEY

// using chrome requires the user to have a verion of chrome driver installed for selenium

let getDefaultSessionName = () => 'jest'

// if jasmine global is available, add test metadata and use test name as default session name
/* eslint-disable no-undef */
let jasmineReporterAdded = false
if (jasmine) {
  if (!jasmineReporterAdded) {
    jasmine.getEnv().addReporter({
      specStarted: (result) => (jasmine.currentTest = result),
      specDone: (result) => (jasmine.currentTest = result),
    })
    jasmineReporterAdded = true
  }
  getDefaultSessionName = () => jasmine.currentTest.fullName
}
/* eslint-enable no-undef */

const sessionDefaults = {
  platformName: OSX,
  browserName: SAFARI,
}

export const startSession = process.env.LOCAL_ENV
  ? async () => {
      jest.setTimeout(800000)
      const _builder = await new Builder().forBrowser(SAFARI).build()
      return _builder
    }
  : async (options = {}) => {
      const { name, platformName, browserName } = {
        ...sessionDefaults,
        ...options,
      }
      jest.setTimeout(800000)
      const driver = await new webdriver.Builder()
        .withCapabilities({
          browserName,
          platformName,
          browserVersion: 'latest',
          'goog:chromeOptions': { w3c: true },
          'sauce:options': {
            extendedDebugging: true,
            username,
            accessKey,
            seleniumVersion: '3.141.59',
            build: 'databyss-org/databyss',
            name: name || getDefaultSessionName(),
            maxDuration: 10800,
            maxInstances: 1,
            commandTimeout: 600,
            idleTimeout: 120,
          },
        })
        .usingServer('https://ondemand.saucelabs.com/wd/hub')
        .build()

      const session = await driver.getSession()
      driver.sessionID = session.id_
      return driver
    }
