const bugsnag = require('@databyss-org/services/lib/bugsnag')
const bugsnagExpress = require('@bugsnag/plugin-express')

export const bugsnagClient = bugsnag('API')
const init = async () => {
  bugsnagClient.use(bugsnagExpress)
  return bugsnagClient.getPlugin('express')
}

export default init
