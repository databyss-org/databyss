import { registerDbHandlers } from './db-handlers'
import { registerFileHandlers } from './file-handlers'
import { registerStateHandlers } from './state-handlers'
import { registerPlatformHandlers } from './platform-handlers'

export function registerHandlers() {
  registerDbHandlers()
  registerFileHandlers()
  registerStateHandlers()
  registerPlatformHandlers()
}
