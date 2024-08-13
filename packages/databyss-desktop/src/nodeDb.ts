import PouchDB from 'pouchdb-node'
import PouchDBFind from 'pouchdb-find'
import PouchDBUpsert from 'pouchdb-upsert'
import PouchDbQuickSearch from 'pouchdb-quick-search'
import { BrowserWindow } from 'electron'
import path from 'path'
import fs from 'fs-extra'
import {
  Block,
  BlockRelation,
  BlockType,
  Document,
  DocumentDict,
  Embed,
  Group,
  Page,
} from '@databyss-org/services/interfaces'
import {
  DbDocument,
  DocumentType,
  UserPreference,
} from '@databyss-org/data/pouchdb/interfaces'
import { appState } from './eapi/handlers/state-handlers'
import { addTimeStamp } from '@databyss-org/data/pouchdb/docUtils'
import { sendCommandToBrowser } from './menus'
import {
  backupDbToJson,
  makeBackupFilename,
} from '@databyss-org/data/pouchdb/backup'

PouchDB.plugin(PouchDBFind)
PouchDB.plugin(PouchDBUpsert)
PouchDB.plugin(PouchDbQuickSearch)

export interface NodeDbRef {
  current: PouchDB.Database<any> | null
  dbPath: string | null
  groupId: string | null
}

export type DocumentIndex<T> = { [key: string]: T }

export class DbTables {
  userPreferences: DocumentIndex<UserPreference>
  blocks: DocumentIndex<Block>
  entries: DocumentIndex<Block>
  topics: DocumentIndex<Block>
  sources: DocumentIndex<Block>
  pages: DocumentIndex<Page>
  groups: DocumentIndex<Group>
  relations: DocumentIndex<BlockRelation>
  embeds: DocumentIndex<Embed>

  constructor() {
    this.userPreferences = {}
    this.blocks = {}
    this.entries = {}
    this.topics = {}
    this.sources = {}
    this.pages = {}
    this.groups = {}
    this.relations = {}
    this.embeds = {}
  }
}

export function dumpTables(tables: DbTables) {
  for (const [key, value] of Object.entries(tables)) {
    const _keys = Object.keys(value)
    console.log(key, _keys.length)
    if (_keys.length) {
      const _firstKey = Object.keys(value)[0]
      console.log(_firstKey, value[_firstKey])
    }
  }
}

const blockTypeToTableKey = {
  [BlockType.Embed]: 'embeds',
  [BlockType.Entry]: 'entries',
  [BlockType.Source]: 'sources',
  [BlockType.Topic]: 'topics',
  [BlockType.EndSource]: '',
  [BlockType.EndTopic]: '',
  [BlockType.Link]: '',
  [BlockType._ANY]: '',
}

const documentTypeToTableKey = {
  [DocumentType.Block]: '',
  [DocumentType.BlockRelation]: 'relations',
  [DocumentType.Group]: 'groups',
  [DocumentType.Page]: 'pages',
  [DocumentType.Selection]: '',
  [DocumentType.UserPreferences]: 'userPreferences',
}

export type FieldSelector<T extends Document> = (doc: T) => string

export const nodeDbRefs: { [windowId: number]: NodeDbRef } = {}

export function groupDbIntoTables(
  dbRows: DbDocument[],
  idSelector: FieldSelector<DbDocument> = (doc) => doc._id
) {
  const _tables = new DbTables()

  dbRows.forEach((_row) => {
    let _tableKey: keyof DbTables
    if (_row.doctype === DocumentType.Block) {
      _tableKey = blockTypeToTableKey[_row.type] as keyof DbTables
      _tables.blocks[idSelector(_row)] = _row as any
    } else {
      _tableKey = documentTypeToTableKey[_row.doctype] as keyof DbTables
    }
    const _table = _tables[_tableKey]
    if (_table) {
      _table[idSelector(_row)] = _row as any
    }
  })

  return _tables
}

export async function handleMergeImport(
  filePath: string,
  importIntoGroupId: string | null,
  windowId: number
) {
  console.log('[DB] merge import', filePath, importIntoGroupId)
  const _buf = fs.readFileSync(filePath)
  const _dbJson = JSON.parse(_buf.toString()) as any[]
  const _sourceTables = groupDbIntoTables(_dbJson)

  console.log('[DB] tables to import')
  dumpTables(_sourceTables)

  // open group db if it is not already open
  const _dbRef = await initNodeDb(windowId, importIntoGroupId, false)

  // get all target db records except entries
  const _findRes = await _dbRef.current!.find({
    selector: {
      $or: [
        { type: BlockType.Source },
        { type: BlockType.Topic },
        { doctype: DocumentType.BlockRelation },
      ],
    },
  })
  console.log('[DB] target tables')
  const _targetTables = groupDbIntoTables(_findRes.docs, (doc) => {
    // for blockRelation records, use the id as index
    if (doc.doctype === DocumentType.BlockRelation) {
      return doc._id
    }
    // otherwise use the name as index
    return ((doc as unknown) as Block).text.textValue.toLowerCase()
  })
  dumpTables(_targetTables)

  // iterate over the topics and sources
}

// returns docs to write
export async function mergeBlocksIntoDb(
  srcDbTables: DbTables,
  destDbTables: DbTables
) {
  const _mergedDocs: Document[] = []

  for (const _srcBlock of Object.values(srcDbTables.blocks)) {
    // find block in dest tables
    const _destBlock = destDbTables.blocks[_srcBlock.text?.textValue]
    if (_destBlock) {
      // get the relation records for the block
      const _srcRelation = srcDbTables.relations[`r_${_srcBlock._id}`]
      const _destRelation = destDbTables.relations[`r_${_destBlock._id}`]
      // add pages from source relation to dest relation
      _destRelation.pages = _destRelation.pages.concat(_srcRelation.pages)
      // add relation to the mergedBlocks return array
      _mergedDocs.push(_destRelation)
      // update block and inline references on src pages
      _srcRelation.pages.forEach((_pageId) => {})
    }
  }
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
  const groups = (appState.get('localGroups') ?? []) as Group[]
  const _existingGroup = groups.find((group) => group._id === groupId)
  if (_existingGroup) {
    sendCommandToBrowser('notify', {
      message: `Cannot import Databyss because it already exists as "${_existingGroup.name}". If you are sure this is correct, you must remove the existing Databyss named "${_existingGroup.name}" before importing the selected file.`,
      error: true,
    })
    return false
  }
  // init pouchdb with groupid as path
  const windowId = BrowserWindow.getFocusedWindow().id
  await initNodeDb(windowId, groupId)
  // import all the docs
  const res = await nodeDbRefs[windowId].current.bulkDocs(
    dbJson,
    { new_edits: false } // not change revision
  )
  // if GROUP doc doesn't exist, create it
  let groupDoc: Group = null
  try {
    groupDoc = await nodeDbRefs[windowId].current.get<Group>(groupId)
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
    await nodeDbRefs[windowId].current.put(
      addTimeStamp({
        doctype: DocumentType.Group,
        ...groupDoc,
      })
    )
  }
  // add GROUP doc to app state
  appState.set('localGroups', [...groups, groupDoc])
  console.log('[DB] import done', res)
  setGroupLoaded(windowId)
  return true
}

export async function reconstructLocalGroups(dataPath: string) {
  const _pouchDir = path.join(dataPath, 'pouchdb')
  if (!fs.existsSync(_pouchDir)) {
    return false
  }
  let _localGroups = appState.get('localGroups') ?? []
  if (_localGroups.length > 0) {
    sendCommandToBrowser('notify', {
      message:
        'Warning: Collections already exist in current data directory. These will not be available in the Databyss menu unless you change back to the current data directory.',
    })
    _localGroups = []
  }
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
      await _db.close()
    } catch (ex) {
      console.warn('[DB] failed to restore group doc', _dbName, ex)
      continue
    }
  }
  return true
}

export async function setDataPath(dataPath: string) {
  // if dir is not empty, see if it's an existing Databyss data dir
  // console.log('[DB] setDataPath ls', _ls)

  // reconstruct localGroups
  if (await reconstructLocalGroups(dataPath)) {
    appState.set('dataPath', dataPath)
    return
  }
  if (await reconstructLocalGroups(path.join(dataPath, 'Databyss'))) {
    appState.set('dataPath', path.join(dataPath, 'Databyss'))
    return
  }

  // otherwise move existing data
  sendCommandToBrowser('notify', {
    message: 'Moving data directory…',
    showConfirmButtons: false,
  })
  // if dir is not empty, create a subdir called 'Databyss'
  let _nextDataPath = dataPath
  let _ls = fs.readdirSync(_nextDataPath).filter((name) => name !== '.DS_Store')
  if (_ls.length > 0) {
    _nextDataPath = path.join(_nextDataPath, 'Databyss')
    if (fs.existsSync(_nextDataPath)) {
      sendCommandToBrowser('notify', {
        message:
          'Cannot move data because selected directory is not empty or an existing Databyss directory',
        error: true,
      })
      return
    }
    fs.mkdirSync(_nextDataPath)
  }
  // if current data path has 'pouchdb' dir already, move it (and media)
  // to new directory
  _ls = fs.readdirSync(appState.get('dataPath'))
  // console.log('[DB] setDataPath ls', _ls)
  const _pathsToDelete: string[] = []
  if (_ls.includes('pouchdb')) {
    fs.copySync(
      path.join(appState.get('dataPath'), 'pouchdb'),
      path.join(_nextDataPath, 'pouchdb'),
      {
        preserveTimestamps: true,
        recursive: true,
      }
    )
    _pathsToDelete.push(path.join(appState.get('dataPath'), 'pouchdb'))
    if (_ls.includes('media')) {
      fs.copySync(
        path.join(appState.get('dataPath'), 'media'),
        path.join(_nextDataPath, 'media'),
        {
          preserveTimestamps: true,
          recursive: true,
        }
      )
      _pathsToDelete.push(path.join(appState.get('dataPath'), 'media'))
    }
    if (_ls.includes('archive')) {
      fs.copySync(
        path.join(appState.get('dataPath'), 'archive'),
        path.join(_nextDataPath, 'archive'),
        {
          preserveTimestamps: true,
          recursive: true,
        }
      )
      _pathsToDelete.push(path.join(appState.get('dataPath'), 'archive'))
    }
  }
  _pathsToDelete.forEach((_pathToDelete) => {
    fs.removeSync(_pathToDelete)
  })
  appState.set('dataPath', _nextDataPath)
  sendCommandToBrowser('hideNotify')
}

export async function archiveDatabyss(groupId: string) {
  const _dbDirPath = path.join(appState.get('dataPath'), 'pouchdb')
  if (!fs.existsSync(_dbDirPath)) {
    console.warn('[DB] cannot archive, database not found', groupId)
    return false
  }
  const _db = new PouchDB(path.join(_dbDirPath, groupId))
  const _dbJson = await backupDbToJson(_db)
  const _archiveDir = path.join(appState.get('dataPath'), 'archive')
  if (!fs.existsSync(_archiveDir)) {
    fs.mkdirSync(_archiveDir)
  }
  const _filename = `${makeBackupFilename(groupId)}.json`
  const _archivePath = path.join(_archiveDir, _filename)
  fs.writeFileSync(_archivePath, _dbJson)
  return _archivePath
}

export function getWindowIdForGroup(groupId: string) {
  const _windowId = Object.entries(nodeDbRefs).find(
    ([windowId, dbRef]) => dbRef.groupId === groupId
  )?.[0]
  if (!_windowId) {
    return null
  }
  return parseInt(_windowId, 10)
}

export async function findSearchIndexDb(groupId: string) {
  const _dbDirPath = getDbDirPath()
  const _dirInfo = await fs.readdir(_dbDirPath)
  const _searchDbPathPrefix = `${groupId}-search`
  console.log('[findSearchIndexDb] db prefix', _searchDbPathPrefix)
  const _searchDbName = _dirInfo.find((_path) => {
    return _path.startsWith(_searchDbPathPrefix)
  })
  const _searchDbPath = _searchDbName
    ? path.join(_dbDirPath, _searchDbName)
    : null
  // console.log('[findSearchIndexDb] search db path', _searchDbPath)
  return _searchDbPath
}

export async function buildSearchIndexDb(db: PouchDB.Database<any>) {
  await db.search({
    fields: ['text.textValue'],
    build: true,
  })
  console.log('[buildSearchIndexDb] indexing done')
}

export function getDbDirPath(groupId?: string) {
  const _dbDirPath = path.join(appState.get('dataPath'), 'pouchdb')
  return groupId ? path.join(_dbDirPath, groupId) : _dbDirPath
}

export function createNodeDb(dbPath: string) {
  return new PouchDB(dbPath)
}

export async function initNodeDb(
  windowId: number,
  groupId: string,
  buildSearchIndex: boolean = true
) {
  // if group is already loaded, return dbRef
  const _existingWindow = getWindowIdForGroup(groupId)
  if (_existingWindow) {
    console.warn('[DB] group already loaded', groupId)
    return nodeDbRefs[_existingWindow]
  }
  // close existing db if necessary
  if (nodeDbRefs[windowId]?.current) {
    await nodeDbRefs[windowId].current.close()
  }
  const _dbDirPath = getDbDirPath()
  if (!fs.existsSync(_dbDirPath)) {
    fs.mkdirSync(_dbDirPath)
  }
  nodeDbRefs[windowId] = {
    dbPath: path.join(_dbDirPath, groupId),
    groupId: groupId,
    current: null,
  }
  console.log('[DB] db path', nodeDbRefs[windowId].dbPath)
  nodeDbRefs[windowId].current = new PouchDB(nodeDbRefs[windowId].dbPath)
  appState.set('lastActiveGroupId', groupId)

  if (buildSearchIndex) {
    const _searchIndexDbPath = await findSearchIndexDb(groupId)
    if (!_searchIndexDbPath) {
      console.log(
        '[initNodeDb] search index db not found, building in background'
      )
      buildSearchIndexDb(nodeDbRefs[windowId].current)
    }
  }

  return nodeDbRefs[windowId]
}

export function setGroupLoaded(windowId: number) {
  BrowserWindow.fromId(windowId).webContents.send(
    'db-groupLoaded',
    nodeDbRefs[windowId].groupId
  )
}
