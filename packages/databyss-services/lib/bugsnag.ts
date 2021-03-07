import Bugsnag from '@bugsnag/js'
import { BrowserConfig, Event } from '@bugsnag/browser'
import { NodeConfig } from '@bugsnag/node'
import packageJson from '../package.json'

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
    onError: (event: Event) => {
      if (!process.env.BUGSNAG_NOTIFY) {
        console.log('BUGSNAG_ERROR', JSON.stringify(event, null, 2))
        return false
      }
      return true
    },
    ...(options || {}),
  })
}
