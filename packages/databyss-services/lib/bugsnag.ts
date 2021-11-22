import Bugsnag from '@bugsnag/js'
import { BrowserConfig } from '@bugsnag/browser'
import { NodeConfig } from '@bugsnag/node'
import packageJson from '../package.json'

// if (window?.fetch) {
//   console.log('[Bugsnag] Patching window.fetch')
//   const _fetch = window.fetch
//   window.fetch = function () {
//     console.log('[Bugsnag] fetch.arguments', arguments)
//   }
// }

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
      return true
    },
    ...(options || {}),
  })
}
