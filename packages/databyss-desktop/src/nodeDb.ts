import PouchDB from 'pouchdb-node'
import PouchDBFind from 'pouchdb-find'
import PouchDBUpsert from 'pouchdb-upsert'
import PouchDbQuickSearch from 'pouchdb-quick-search'
import { BrowserWindow, app, ipcMain, ipcRenderer } from 'electron'
import path from 'path'
import fs from 'fs-extra'
import { Group } from '@databyss-org/services/interfaces'
import {
  DocumentType,
  UserPreference,
} from '@databyss-org/data/pouchdb/interfaces'
import { appState } from './eapi/handlers/state-handlers'
import { addTimeStamp } from '@databyss-org/data/pouchdb/docUtils'

PouchDB.plugin(PouchDBFind)
PouchDB.plugin(PouchDBUpsert)
PouchDB.plugin(PouchDbQuickSearch)

// export const appDbPath = path.join(app.getPath('userData'), 'pouchdb')
// if (!fs.existsSync(appDbPath)) {
//   fs.mkdirSync(appDbPath)
// }

export interface NodeDbRef {
  current: PouchDB.Database<any> | null
  dbPath: string | null
  groupId: string | null
}

export const nodeDbRef: NodeDbRef = {
  current: null,
  dbPath: null,
  groupId: null,
}

export async function handleImport(filePath: string) {
  console.log('[DB] import', filePath)
  const buf = fs.readFileSync(filePath)
  const dbJson = JSON.parse(buf.toString()) as any[]
  // get groupid from user_preference
  const prefsDoc = dbJson.find(
    (doc) => doc._id === 'user_preference'
  ) as UserPreference
  if (!prefsDoc) {
    console.warn('[DB] no prefs doc found')
    return false
  }
  const groupId = prefsDoc.belongsToGroup
  console.log('[DB] found groupid', groupId)
  // init pouchdb with groupid as path
  initNodeDb(groupId)
  // import all the docs
  const res = await nodeDbRef.current.bulkDocs(
    dbJson,
    { new_edits: false } // not change revision
  )
  // if GROUP doc doesn't exist, create it
  let groupDoc: Group = null
  try {
    groupDoc = await nodeDbRef.current.get<Group>(groupId)
  } catch (_) {}
  if (groupDoc === null) {
    let username = prefsDoc.email.split('@')[0]
    if (username.includes('.')) {
      username = username.split('.')[0]
    }
    username = username[0].toUpperCase().concat(username.substring(1))
    groupDoc = {
      name: `${username}'s Databyss`,
      pages: [],
      _id: groupId,
      localGroup: true,
    }
    await nodeDbRef.current.put(
      addTimeStamp({
        doctype: DocumentType.Group,
        ...groupDoc,
      })
    )
  }
  // add GROUP doc to app state
  const groups = (appState.get('localGroups') ?? []) as Group[]
  appState.set('localGroups', [...groups, groupDoc])
  console.log('[DB] import done', res)
  setGroupLoaded()
  return groupId
}

export async function reconstructLocalGroups(dataPath: string) {
  const _pouchDir = path.join(dataPath, 'pouchdb')
  const _localGroups: Group[] = []
  const _dbNames = fs
    .readdirSync(_pouchDir)
    .filter((n) => n.startsWith('g_') && !n.includes('-search'))
  for (const _dbName of _dbNames) {
    console.log('[DB] restore', _dbName)
    const _db = new PouchDB(path.join(_pouchDir, _dbName))
    try {
      const _groupDoc = await _db.get<Group>(_dbName)
      _localGroups.push(_groupDoc)
      appState.set('localGroups', _localGroups)
      _db.close()
    } catch (ex) {
      console.warn('[DB] failed to restore group doc', _dbName, ex)
      continue
    }
  }
}

export async function setDataPath(dataPath: string) {
  let _nextDataPath = dataPath
  // if dir is not empty, see if it's an existing Databyss data dir
  let _ls = fs.readdirSync(_nextDataPath).filter((name) => name !== '.DS_Store')
  // console.log('[DB] setDataPath ls', _ls)
  if (_ls.includes('pouchdb')) {
    // reconstruct localGroups
    await reconstructLocalGroups(_nextDataPath)
  } else {
    // otherwise move existing data
    // if dir is not empty, create a subdir called 'Databyss'
    if (_ls.length > 0) {
      _nextDataPath = path.join(_nextDataPath, 'Databyss')
      fs.mkdirSync(_nextDataPath)
    }
    // if current data path has 'pouchdb' dir already, move it (and media)
    // to new directory
    _ls = fs.readdirSync(appState.get('dataPath'))
    // console.log('[DB] setDataPath ls', _ls)
    if (_ls.includes('pouchdb')) {
      fs.copySync(
        path.join(appState.get('dataPath'), 'pouchdb'),
        path.join(_nextDataPath, 'pouchdb'),
        {
          preserveTimestamps: true,
          recursive: true,
        }
      )
      if (_ls.includes('media')) {
        fs.copySync(
          path.join(appState.get('dataPath'), 'media'),
          path.join(_nextDataPath, 'media'),
          {
            preserveTimestamps: true,
            recursive: true,
          }
        )
      }
    }
  }
  // update dataPath in state
  appState.set('dataPath', _nextDataPath)
}

export function initNodeDb(groupId: string) {
  const _dbDirPath = path.join(appState.get('dataPath'), 'pouchdb')
  if (!fs.existsSync(_dbDirPath)) {
    fs.mkdirSync(_dbDirPath)
  }
  nodeDbRef.dbPath = path.join(_dbDirPath, groupId)
  console.log('[DB] db path', nodeDbRef.dbPath)
  nodeDbRef.current = new PouchDB(nodeDbRef.dbPath)
  nodeDbRef.groupId = groupId
  appState.set('lastActiveGroupId', groupId)
}

export function setGroupLoaded() {
  BrowserWindow.getFocusedWindow().webContents.send(
    'db-groupLoaded',
    nodeDbRef.groupId
  )
}
