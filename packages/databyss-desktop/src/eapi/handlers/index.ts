import { registerDbHandlers } from './db-handlers'
import { registerFileHandlers } from './file-handlers'
import { registerStateHandlers } from './state-handlers'
import { registerPlatformHandlers } from './platform-handlers'
import { registerPdfHandlers } from './pdf-handlers'
import { registerPublishHandlers } from './publish-handlers'

export function registerHandlers() {
  registerDbHandlers()
  registerFileHandlers()
  registerStateHandlers()
  registerPlatformHandlers()
  registerPdfHandlers()
  registerPublishHandlers()
}
