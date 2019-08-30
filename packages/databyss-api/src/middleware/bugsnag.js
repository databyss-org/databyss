import packageJson from '../../package.json'

const bugsnag = require('@bugsnag/js')
const bugsnagExpress = require('@bugsnag/plugin-express')

export const bugsnagClient = bugsnag({
  apiKey: process.env.API_BUGSNAG_KEY,
  appVersion: packageJson.version,
  releaseStage: process.env.API_BUGSNAG_RELEASE_STAGE,
})

const init = async () => {
  bugsnagClient.use(bugsnagExpress)
  return bugsnagClient.getPlugin('express')
}

export default init
