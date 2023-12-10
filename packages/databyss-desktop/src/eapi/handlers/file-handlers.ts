import { dialog, ipcMain } from 'electron'

export function registerFileHandlers() {
  ipcMain.handle(
    'file-open',
    async (_, args) => await dialog.showOpenDialog({ properties: ['openFile'] })
  )
}
