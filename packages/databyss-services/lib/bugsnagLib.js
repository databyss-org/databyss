import bugsnag from '@bugsnag/js'

export default options =>
  bugsnag({
    apiKey: process.env.BUGSNAG_KEY,
    releaseStage: process.env.BUGSNAG_RELEASE_STAGE,
    beforeSend: report => {
      if (!process.env.BUGSNAG_NOTIFY) {
        report.ignore()
      }
    },
    ...options,
  })
