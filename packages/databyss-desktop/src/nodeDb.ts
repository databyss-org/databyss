import PouchDB from 'pouchdb-node'
import PouchDBFind from 'pouchdb-find'
import PouchDBUpsert from 'pouchdb-upsert'
// import PouchDbQuickSearch from 'pouchdb-quick-search'
import { BrowserWindow, app, ipcMain, ipcRenderer } from 'electron'
import path from 'path'
import fs from 'fs'
import { Group } from '@databyss-org/services/interfaces'
import {
  DocumentType,
  UserPreference,
} from '@databyss-org/data/pouchdb/interfaces'
import { appState } from './eapi/handlers/state-handlers'
import { addTimeStamp } from '@databyss-org/data/pouchdb/docUtils'

PouchDB.plugin(PouchDBFind)
PouchDB.plugin(PouchDBUpsert)

export const appDbPath = path.join(app.getPath('userData'), 'pouchdb')
if (!fs.existsSync(appDbPath)) {
  fs.mkdirSync(appDbPath)
}

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

export function initNodeDb(groupId: string) {
  nodeDbRef.dbPath = path.join(appDbPath, groupId)
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
