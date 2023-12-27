import { ipcMain } from 'electron'
import os from 'os'

export function registerPlatformHandlers() {
  ipcMain.handle('platform-os', async (_, args) => os.platform())
}
