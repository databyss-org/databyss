import Bugsnag from '@databyss-org/services/lib/Bugsnag'
import bugsnagExpress from '@bugsnag/plugin-express'

export const bugsnagClient = Bugsnag.init('API')
const init = async () => {
  bugsnagClient.use(bugsnagExpress)
  return bugsnagClient.getPlugin('express')
}

export default init
