import webdriver, { Builder } from 'selenium-webdriver'

export const CHROME = 'chrome'
export const FIREFOX = 'firefox'
export const SAFARI = 'safari'
export const WIN = 'Windows 10'
export const OSX = 'OS X 10.14'

const username = process.env.SAUCE_USERNAME
const accessKey = process.env.SAUCE_ACCESS_KEY

export const startSession = process.env.LOCAL_ENV
  ? async () => {
      jest.setTimeout(40000)

      const _builder = await new Builder().forBrowser('safari').build()
      return _builder
    }
  : async (name, platformName = WIN, browserName = CHROME) => {
      jest.setTimeout(80000)
      const driver = await new webdriver.Builder()
        .withCapabilities({
          browserName,
          platformName,
          browserVersion: 'latest',
          'goog:chromeOptions': { w3c: true },
          'sauce:options': {
            extendedDebugging: true,
            // prerun: {
            //   executable:
            //     'https://raw.githubusercontent.com/databyss-org/databyss/paul/clipboard/scripts/osx-forward-80.sh',
            //   background: false,
            // },
            username,
            accessKey,
            seleniumVersion: '3.141.59',
            build: 'databyss-org/ui',
            name,
            maxDuration: 7200,
            idleTimeout: 1000,
          },
        })
        .usingServer('https://ondemand.saucelabs.com/wd/hub')
        .build()

      const session = await driver.getSession()
      driver.sessionID = session.id_
      return driver
    }
