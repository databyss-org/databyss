import bugsnag from '@bugsnag/js'

export default (envPrefix, options) =>
  bugsnag({
    apiKey: process.env[`${envPrefix}_BUGSNAG_KEY`],
    releaseStage: process.env[`${envPrefix}_BUGSNAG_RELEASE_STAGE`],
    beforeSend: report => {
      if (!process.env[`${envPrefix}_BUGSNAG_NOTIFY`]) {
        report.ignore()
      }
    },
    ...options,
  })
