import packageJson from '../package.json'
import bugsnagLib from './bugsnagLib'

// singleton pattern
const Bugsnag = { client: { leaveBreadcrumb: () => null, notify: () => null } }
Bugsnag.init = (envPrefix, options = {}) => {
  Bugsnag.client = bugsnagLib(envPrefix, {
    appVersion: packageJson.version,
    consoleBreadcrumbsEnabled: false,
    ...options,
  })
  return Bugsnag.client
}

export default Bugsnag
