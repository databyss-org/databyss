import packageJson from '../package.json'
import Bugsnag from '@bugsnag/js'
import { BrowserConfig } from '@bugsnag/browser'
import { NodeConfig } from '@bugsnag/node'

export const startBugsnag = (
  options?: Partial<BrowserConfig> | Partial<NodeConfig>
) => {
  if (!process.env.BUGSNAG_KEY) {
    return
  }
  Bugsnag.start({
    apiKey: process.env.BUGSNAG_KEY!,
    releaseStage: process.env.BUGSNAG_RELEASE_STAGE,
    appVersion: packageJson.version,
    onError: () => {
      if (!process.env.BUGSNAG_NOTIFY) {
        return false
      }
    },
    ...(options || {}),
  })
}
