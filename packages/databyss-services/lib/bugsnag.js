import packageJson from '../package.json'
import bugsnagLib from './bugsnagLib'

// singleton pattern
const Bugsnag = { client: null }
Bugsnag.init = (envPrefix, options = {}) => {
  Bugsnag.client = bugsnagLib(envPrefix, {
    appVersion: packageJson.version,
    ...options,
  })
  return Bugsnag.client
}

export default Bugsnag
