import { dialog, ipcMain, shell } from 'electron'
import fs from 'fs'
import path from 'path'
import {
  handleImport,
  nodeDbRef,
  setDataPath,
  setGroupLoaded,
} from '../../nodeDb'
import { appState } from './state-handlers'
import { createDatabyss } from '../../lib/createDatabyss'
import { opengraph } from '@databyss-org/services/embeds/remoteMedia'

export interface IpcFile {
  buffer: ArrayBuffer
  name: string
  path: string
  type: string
  size: number
  lastModified: number
}

export const mediaPath = () => path.join(appState.get('dataPath'), 'media')

export async function onImportDatabyss() {
  const dialogRes = await dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [{ extensions: ['json'], name: 'Databyss collection' }],
  })
  console.log('[FILE] onImportDatabyss', dialogRes)
  if (dialogRes.canceled) {
    return false
  }
  await handleImport(dialogRes.filePaths[0])
  return true
}

export async function onChooseDataPath() {
  const dialogRes = await dialog.showOpenDialog({
    properties: ['openDirectory'],
  })
  console.log('[FILE] onChooseDataPath', dialogRes)
  if (dialogRes.canceled) {
    return false
  }
  setDataPath(dialogRes.filePaths[0])
}

export async function closeDatabyss() {
  nodeDbRef.groupId = null
  appState.set('lastActiveGroupId', null)
  appState.set('lastRoute', null)
  appState.set('lastSidebarRoute', null)
  setGroupLoaded()
}

export function registerFileHandlers() {
  // ensure media dir
  if (!fs.existsSync(mediaPath())) {
    fs.mkdirSync(mediaPath())
  }
  ipcMain.handle(
    'file-open',
    async (_, args) => await dialog.showOpenDialog({ properties: ['openFile'] })
  )
  ipcMain.handle('file-chooseDataPath', onChooseDataPath)
  ipcMain.handle('file-importDatabyss', onImportDatabyss)
  ipcMain.handle('file-newDatabyss', createDatabyss)
  ipcMain.handle('file-importMedia', (_, file: IpcFile, fileId: string) => {
    console.log('[IPC] importMedia', file.name)
    const _mediaItemDir = path.join(mediaPath(), nodeDbRef.groupId, fileId)
    const { buffer, ...meta } = file
    fs.mkdirSync(_mediaItemDir, { recursive: true })
    // write the buffer
    fs.writeFileSync(path.join(_mediaItemDir, file.name), new DataView(buffer))
    // write the metadata
    fs.writeFileSync(
      path.join(_mediaItemDir, 'meta.json'),
      JSON.stringify(meta)
    )
  })
  ipcMain.on('file-openNative', (_, path: string) => {
    const _path = decodeURIComponent(
      path.replace('dbdrive://', `${mediaPath()}/`)
    )
    shell.openPath(_path)
  })
  ipcMain.handle('file-deleteMedia', (_, fileId: string) => {
    const _mediaItemDir = path.join(mediaPath(), nodeDbRef.groupId, fileId)
    fs.rmdirSync(_mediaItemDir, { recursive: true })
  })
  ipcMain.handle('file-getEmbedDetail', async (_, urlOrHtml: string) => {
    const _detail = await opengraph(urlOrHtml)
    return _detail
  })
}
