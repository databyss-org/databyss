import { dialog, ipcMain, shell } from 'electron'
import fs from 'fs-extra'
import path from 'path'
import {
  archiveDatabyss,
  handleImport,
  nodeDbRef,
  setDataPath,
  setGroupLoaded,
} from '../../nodeDb'
import { appState } from './state-handlers'
import { createDatabyss } from '../../lib/createDatabyss'
import { opengraph } from '@databyss-org/services/embeds/remoteMedia'
import { backupDbToJson, makeBackupFilename } from '@databyss-org/data/pouchdb/backup'
import PouchDb from 'pouchdb-node'

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
  if (dialogRes.canceled) {
    return false
  }
  return handleImport(dialogRes.filePaths[0])
}

export async function onChooseDataPath() {
  const dialogRes = await dialog.showOpenDialog({
    properties: ['openDirectory', 'createDirectory'],
    
  })
  // console.log('[FILE] onChooseDataPath', dialogRes)
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

async function archiveAndRemoveDatabyss(groupId: string) {
  // backup databyss to json 
  const _archivePath = await archiveDatabyss(groupId)
  if (!_archivePath) {
    return false
  }
  // remove from groups
  const _groups = appState.get('localGroups')
  appState.set('localGroups', _groups.filter((group) => group._id !== groupId))
  // delete db files
  const _ls = fs.readdirSync(path.join(appState.get('dataPath'), 'pouchdb'))
    .filter((dir) => dir.startsWith(groupId))
    .forEach((dir) => {
      fs.removeSync(path.join(appState.get('dataPath'), 'pouchdb', dir))
    })
  return _archivePath
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
  ipcMain.handle('file-archiveDatabyss', (_, groupId: string) => archiveAndRemoveDatabyss(groupId))
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
    fs.removeSync(_mediaItemDir)
  })
  ipcMain.handle('file-getEmbedDetail', async (_, urlOrHtml: string) => {
    const _detail = await opengraph(urlOrHtml)
    return _detail
  })
}
