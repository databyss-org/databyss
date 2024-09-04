import { BrowserWindow, dialog, ipcMain, shell } from 'electron'
import fs from 'fs-extra'
import JSZip from 'jszip'
import path from 'path'
import {
  archiveDatabyss,
  buildSearchIndexDb,
  groupDbIntoTables,
  handleImport,
  handleImportMedia,
  handleMergeImport,
  NodeDbRef,
  nodeDbRefs,
  setDataPath,
  setGroupLoaded,
} from '../../nodeDb'
import { appState } from './state-handlers'
import { createDatabyss } from '../../lib/createDatabyss'
import { opengraph } from '@databyss-org/services/embeds/remoteMedia'
import { DbRef } from '@databyss-org/data/pouchdb/dbRef'
import { DbDocument } from '@databyss-org/data/pouchdb/interfaces'
import { BlockType, Embed, Group } from '@databyss-org/services/interfaces'
import { makeBackupFilename } from '@databyss-org/data/pouchdb/backup'
import eapi from '../'

export interface IpcFile {
  buffer: ArrayBuffer
  name: string
  path: string
  type: string
  size: number
  lastModified: number
}

export const mediaPath = () => path.join(appState.get('dataPath'), 'media')

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
  const windowId = BrowserWindow.getFocusedWindow().id
  nodeDbRefs[windowId].groupId = null
  appState.set('lastActiveGroupId', null)
  appState.set('lastRoute', null)
  appState.set('lastSidebarRoute', null)
  setGroupLoaded(windowId)
}

export function deleteDbFiles(groupId: string) {
  const _ls = fs
    .readdirSync(path.join(appState.get('dataPath'), 'pouchdb'))
    .filter((dir: string) => dir.startsWith(groupId))
    .forEach((dir: string) => {
      fs.removeSync(path.join(appState.get('dataPath'), 'pouchdb', dir))
    })
}

async function archiveAndRemoveDatabyss(groupId: string) {
  // backup databyss to zip
  await archiveDatabyss(groupId)
  // remove from groups
  const _groups = appState.get('localGroups')
  appState.set(
    'localGroups',
    _groups.filter((group) => group._id !== groupId)
  )
  // delete db files
  try {
    deleteDbFiles(groupId)
    // delete media dir
    fs.removeSync(path.join(mediaPath(), groupId))
  } catch (err) {
    const _dbsToDelete = appState.get('dbsToDelete') ?? []
    appState.set('dbsToDelete', _dbsToDelete.concat(groupId))
    console.warn('[archiveAndRemoveDatabyss] failed to delete db files, queueing for deletion on exit', groupId)
  }
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
  ipcMain.handle(
    'file-importDatabyss',
    async (evt, zipFilePath, importIntoGroupId, remoteGroupId) => {
      let dbJson: any[]
      if (remoteGroupId) {
        const _gid = remoteGroupId.substring(2)
        const _url = `${process.env.DBFILE_URL}${remoteGroupId}/databyss-db-${_gid}.json`
        const _res = await fetch(_url)
        dbJson = await _res.json()
      } else {
        dbJson = await getDbJsonFromZip(zipFilePath)
      }
      const sourceTables = groupDbIntoTables(dbJson)
      if (importIntoGroupId) {
        await handleMergeImport(sourceTables, importIntoGroupId, evt.sender.id)
      } else {
        await handleImport(sourceTables)
      }
      await handleImportMedia(
        sourceTables,
        zipFilePath,
        nodeDbRefs[evt.sender.id]
      )
      console.log('[DB] import done')
      setGroupLoaded(evt.sender.id)
      // rebuild the search index
      buildSearchIndexDb(nodeDbRefs[evt.sender.id].current)
    }
  )
  ipcMain.handle('file-newDatabyss', (evt) => createDatabyss(evt.sender.id))
  ipcMain.handle('file-archiveDatabyss', (_, groupId: string) =>
    archiveAndRemoveDatabyss(groupId)
  )
  ipcMain.handle('file-importMedia', (evt, file: IpcFile, fileId: string) => {
    console.log('[IPC] importMedia', file.name)
    const windowId = evt.sender.id
    const _mediaItemDir = path.join(
      mediaPath(),
      nodeDbRefs[windowId].groupId,
      fileId
    )
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
  ipcMain.handle(
    'file-renameMedia',
    (evt, fileId: string, renameTo: string) => {
      console.log('[IPC] renameMedia', fileId, renameTo)
      const windowId = evt.sender.id
      const _mediaItemDir = path.join(
        mediaPath(),
        nodeDbRefs[windowId].groupId,
        fileId
      )
      const _meta = JSON.parse(
        fs.readFileSync(path.join(_mediaItemDir, 'meta.json')).toString()
      ) as IpcFile
      const _safeFilename = renameTo
        .replace(/[/\\?%*:|"<>]/g, '')
        .substring(0, 128)
      fs.renameSync(
        path.join(_mediaItemDir, _meta.name),
        path.join(_mediaItemDir, _safeFilename)
      )
      _meta.name = _safeFilename
      fs.writeFileSync(
        path.join(_mediaItemDir, 'meta.json'),
        JSON.stringify(_meta)
      )
      return _safeFilename
    }
  )
  ipcMain.on('file-openNative', (_, filePath: string) => {
    const _decodedPath = decodeURIComponent(
      filePath.replace('dbdrive://', '')
    )
    const _fixedPath =path.join(mediaPath(), ..._decodedPath.split(/[\/\\]/))
    console.log('[file] openNative', _fixedPath)
    shell.openPath(_fixedPath)
  })
  ipcMain.handle('file-deleteMedia', (evt, fileId: string) => {
    const windowId = evt.sender.id
    const _mediaItemDir = path.join(
      mediaPath(),
      nodeDbRefs[windowId].groupId,
      fileId
    )
    fs.removeSync(_mediaItemDir)
  })
  ipcMain.handle('file-getEmbedDetail', async (_, urlOrHtml: string) => {
    const _detail = await opengraph(urlOrHtml)
    return _detail
  })
}

async function getDbJsonFromZip(zipFilePath: string) {
  const _zipData = fs.readFileSync(zipFilePath)
  const _zip = await JSZip.loadAsync(_zipData)
  const _dbFile = _zip.file('db.json')
  if (!_dbFile) {
    console.error('[getDbJsonFromZip] no db.json found in zip')
    return null
  }
  const _dbFileData = await _dbFile.async('string')
  return JSON.parse(_dbFileData)
}

async function unzipDbFile(zipFilePath: string) {
  console.log('[unzipDbFile] unzip', zipFilePath)
  // create temp dir
  const _tempDir = path.join(
    appState.get('dataPath'),
    'temp',
    fs.mkdtempSync('import-')
  )
  fs.mkdirSync(_tempDir, { recursive: true })
  // read zip file
  const _zipData = fs.readFileSync(zipFilePath)
  const _zip = await JSZip.loadAsync(_zipData)
  const _files: [string, JSZip.JSZipObject][] = []
  _zip.forEach((relativePath, file) => {
    _files.push([relativePath, file])
  })
  for (const [_path, _file] of _files) {
    if (_file.dir) {
      continue
    }
    const _data = await _file.async('nodebuffer')
    const _unzipPath = path.join(_tempDir, _path)
    const _unzipDir = path.parse(_unzipPath).dir
    fs.ensureDirSync(_unzipDir)
    fs.writeFileSync(_unzipPath, _data)
  }
  return _tempDir
}

export async function exportDbToZip(dbRef: NodeDbRef) {
  const _zip = new JSZip().folder(dbRef.groupId!)!
  const { rows } = await dbRef.current!.allDocs({ include_docs: true })
  // collect rows and add media to zip
  const _docs: DbDocument[] = []
  rows.forEach((_row) => {
    const _d: DbDocument = _row.doc
    _docs.push(_d)
    if (_d.type === BlockType.Embed) {
      const _embed = (_d as unknown) as Embed
      if (!_embed.detail.fileDetail) {
        return
      }
      const _mediaItemDir = path.join(mediaPath(), dbRef.groupId, _embed._id)
      if (!fs.existsSync(_mediaItemDir)) {
        return
      }
      const _filename = _embed.detail.fileDetail.filename
      const _buf = fs.readFileSync(path.join(_mediaItemDir, _filename))
      _zip.file(path.join('media', _embed._id, _filename), _buf, {
        binary: true,
      })
    }
  })
  _zip.file('db.json', JSON.stringify(_docs, null, 2))
  const _zipContent = await _zip.generateAsync({ type: 'nodebuffer' })
  // get the group name
  let _group: Group
  try {
    _group = (await dbRef.current.get(dbRef.groupId)) as Group
  } catch (e) {
    // data seems corrupted, skip writing
    console.warn(
      '[exportDbToZip] group not found, data seems corrupted, skipping writing'
    )
    return
  }
  // write the file
  const _filename = makeBackupFilename(dbRef.groupId, _group.name)
  const _dir = path.join(appState.get('dataPath'), 'exports')
  if (!fs.existsSync(_dir)) {
    fs.mkdirSync(_dir)
  }
  const _path = path.join(_dir, `${_filename}.zip`)
  fs.writeFileSync(_path, _zipContent)
  // open file location
  shell.showItemInFolder(_path)
}
