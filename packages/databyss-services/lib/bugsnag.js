import packageJson from '../package.json'

const bugsnag = require('@bugsnag/js')

export default envPrefix =>
  bugsnag({
    apiKey: process.env[`${envPrefix}_BUGSNAG_KEY`],
    appVersion: packageJson.version,
    releaseStage: process.env[`${envPrefix}_BUGSNAG_RELEASE_STAGE`],
  })
