import { BrowserWindow, dialog, ipcMain } from 'electron'
import { handleImport } from '../../nodeDb'

export async function importDatabyssFile() {
  const dialogRes = await dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [{ extensions: ['json'], name: 'Databyss collection' }],
  })
  console.log('[Menu] open', dialogRes)
  if (dialogRes.canceled) {
    return false
  }
  const groupId = await handleImport(dialogRes.filePaths[0])
  if (!!groupId) {
    BrowserWindow.getFocusedWindow().webContents.send('db-setGroupId', groupId)
  }
  return true
}

export function registerFileHandlers() {
  ipcMain.handle(
    'file-open',
    async (_, args) => await dialog.showOpenDialog({ properties: ['openFile'] })
  )
  ipcMain.handle('file-importDatabyss', importDatabyssFile)
}
