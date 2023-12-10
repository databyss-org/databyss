import { registerDbHandlers } from './db-handlers'
import { registerFileHandlers } from './file-handlers'
import { registerStateHandlers } from './state-handlers'

export function registerHandlers() {
  registerDbHandlers()
  registerFileHandlers()
  registerStateHandlers()
}
