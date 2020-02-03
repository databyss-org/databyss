import Bugsnag from '@databyss-org/services/lib/bugsnag'
import bugsnagExpress from '@bugsnag/plugin-express'

const init = async () => {
  Bugsnag.init()
  Bugsnag.client.use(bugsnagExpress)
  return Bugsnag.client.getPlugin('express')
}

export default init
