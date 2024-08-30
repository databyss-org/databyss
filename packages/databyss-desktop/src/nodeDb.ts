import PouchDB from 'pouchdb-node'
import PouchDBFind from 'pouchdb-find'
import PouchDBUpsert from 'pouchdb-upsert'
import PouchDbQuickSearch from 'pouchdb-quick-search'
import { BrowserWindow } from 'electron'
import path from 'path'
import fs from 'fs-extra'
import JSZip from 'jszip'
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
import { updateInlinesInBlock } from '@databyss-org/services/text/inlineUtils'
import { InlineTypes } from '@databyss-org/services/interfaces/Range'
import { exportDbToZip, mediaPath } from './eapi/handlers/file-handlers'
import { DbRef } from '@databyss-org/data/pouchdb/dbRef'
import { Role } from '@databyss-org/data/interfaces/sysUser'
import { uidlc } from '@databyss-org/data/lib/uid'

PouchDB.plugin(PouchDBFind)
PouchDB.plugin(PouchDBUpsert)
PouchDB.plugin(PouchDbQuickSearch)

export interface NodeD_groupIdbRef {
  current: PouchDB.Database<any> | null
  dbPath: string | null
  groupId: string | null
}

export type DocumentMap<T> = Map<string, T>

export class DbTables {
  _docsById: DocumentMap<Document>
  userPreferences: DocumentMap<UserPreference>
  entries: DocumentMap<Block>
  topics: DocumentMap<Block>
  sources: DocumentMap<Block>
  pages: DocumentMap<Page>
  groups: DocumentMap<Group>
  relations: DocumentMap<BlockRelation>
  embeds: DocumentMap<Embed>
  selections: DocumentMap<Selection>

  constructor() {
    this._docsById = new Map()
    this.userPreferences = new Map()
    this.entries = new Map()
    this.topics = new Map()
    this.sources = new Map()
    this.pages = new Map()
    this.groups = new Map()
    this.relations = new Map()
    this.embeds = new Map()
    this.selections = new Map()
  }
}

export function getGroupIdFromTables(tables: DbTables, adminOnly?: boolean) {
  // get groupid from user_preference
  const _prefsDoc = tables.userPreferences.get('user_preference')
  if (!_prefsDoc) {
    console.warn('[DB] no prefs doc found')
    return null
  }
  if (!adminOnly) {
    return _prefsDoc.belongsToGroup
  }
  // find the group where id matches belongsToGroup and has admin rights
  return _prefsDoc.groups.find(
    (_group) =>
      _group.groupId === _prefsDoc.belongsToGroup &&
      _group.role === Role.GroupAdmin
  )?.groupId
}

export function getOrCreateAdminGroup(tables: DbTables) {
  let _groupId = getGroupIdFromTables(tables, true)
  if (_groupId) {
    return tables._docsById.get(_groupId)
  }
  // edge case: importing from a databyss with an exported collection
  //   in this case, there will be no admin group and we should generate a new one
  const _prefsDoc = tables.userPreferences.get('user_preference')
  let _username = 'Imported Databyss'
  if (_prefsDoc.userId.includes('@')) {
    // edge case: importing from old cloud databyss export, use email as name
    _username = _prefsDoc.email.split('@')[0]
    if (_username.includes('.')) {
      _username = _username.split('.')[0]
    }
    _username = _username[0].toUpperCase().concat(_username.substring(1))
    _username = `${_username}'s Databyss`
  } else {
    // edge case: importing from Databyss collection export
    //   in this case there should be one group with a name
    const _groupName = (tables.groups.values().next().value as Group).name
    if (_groupName) {
      _username = _groupName
    }
  }
  const _groupDoc = new Group(_username)
  _groupDoc.localGroup = true

  return _groupDoc
}

export function dumpTables(tables: DbTables) {
  for (const [key, value] of Object.entries(tables)) {
    if (!(value instanceof Map)) {
      continue
    }
    console.log(key, value.size)
    if (value.size) {
      console.log(value.keys().next().value, value.values().next().value)
    }
  }
}

type TableKeyToInlineType = {
  [Property in keyof Partial<DbTables>]: InlineTypes
}

const tableKeyToInlineType: TableKeyToInlineType = {
  topics: InlineTypes.InlineTopic,
  sources: InlineTypes.InlineSource,
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
  [DocumentType.Selection]: 'selections',
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
    // put row into special _docsById table for easy retrieval
    _tables._docsById.set(_row._id, _row as any)
    let _tableKey: keyof DbTables
    if (_row.doctype === DocumentType.Block) {
      _tableKey = blockTypeToTableKey[_row.type] as keyof DbTables
    } else {
      _tableKey = documentTypeToTableKey[_row.doctype] as keyof DbTables
    }
    const _table: DocumentMap<any> = _tables[_tableKey]
    if (_table) {
      _table.set(idSelector(_row), _row)
    }
  })

  return _tables
}

export async function handleMergeImport(
  sourceTables: DbTables,
  importIntoGroupId: string | null,
  windowId: number
) {
  console.log('[DB] merge import', importIntoGroupId)
  // console.log('[DB] tables to import')
  // dumpTables(_sourceTables)

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
  // dumpTables(_targetTables)

  // iterate over the topics and sources
  const _mergedTopics = mergeRelations(sourceTables, _targetTables, 'topics')
  console.log(`[handleMergeImport] merged ${_mergedTopics.length} topics`)
  const _mergedSources = mergeRelations(sourceTables, _targetTables, 'sources')
  console.log(`[handleMergeImport] merged ${_mergedSources.length} sources`)

  // TODO: add importedFromGroup to pages

  // bulk insert from source tables to dest db
  console.log('[handleMergeImport] merging embeds')
  await mergeFromTable(_dbRef, sourceTables.embeds)
  console.log('[handleMergeImport] merging entries')
  await mergeFromTable(_dbRef, sourceTables.entries)
  console.log('[handleMergeImport] merging pages')
  await mergeFromTable(_dbRef, sourceTables.pages)
  console.log('[handleMergeImport] merging relations')
  await mergeFromTable(_dbRef, sourceTables.relations)
  console.log('[handleMergeImport] merging sources')
  await mergeFromTable(_dbRef, sourceTables.sources)
  console.log('[handleMergeImport] merging topics')
  await mergeFromTable(_dbRef, sourceTables.topics)
  console.log('[handleMergeImport] merging selections')
  await mergeFromTable(_dbRef, sourceTables.selections)

  // import group record for imported collection
  const _groupId = getGroupIdFromTables(sourceTables)
  const _groupDoc = sourceTables._docsById.get(_groupId) as Group
  _groupDoc.isImportedGroup = true
  console.log('[handleMergeImport] merging group doc')
  await _dbRef.current.upsert(_groupId, () => _groupDoc)
}

function mergeFromTable(dbRef: NodeDbRef, table: DocumentMap<any>) {
  return dbRef.current.bulkDocs(
    Array.from(table.values()),
    { new_edits: false } // not change revision
  )
}

// returns docs to write
export function mergeRelations(
  srcDbTables: DbTables,
  destDbTables: DbTables,
  tableToMerge: keyof DbTables
) {
  const _mergedDocs: Document[] = []
  const _srcTableToMerge = srcDbTables[tableToMerge] as DocumentMap<Block>
  const _destTableToMerge = destDbTables[tableToMerge] as DocumentMap<Block>
  for (const _srcBlock of _srcTableToMerge.values()) {
    // find related block in dest tables
    const _destBlock = _destTableToMerge.get(
      _srcBlock.text?.textValue.toLowerCase()
    ) as Block
    if (!_destBlock) {
      continue
    }
    console.log(
      `[mergeRelations] merging ${tableToMerge} ${_srcBlock.text.textValue}`
    )
    // get the relation records for the block
    const _srcRelation = srcDbTables.relations.get(`r_${_srcBlock._id}`)
    const _destRelation = destDbTables.relations.get(`r_${_destBlock._id}`)
    // update block and inline references on src pages
    mergeInlines({
      srcRelation: _srcRelation,
      srcDbTables,
      srcBlock: _srcBlock,
      destBlock: _destBlock,
      tableToMerge,
    })
    // add pages from dest relation to source relation
    _srcRelation.pages = _srcRelation.pages.concat(_destRelation.pages)
    // rewrite source relation to match dest id
    _srcRelation.blockId = _destBlock._id
    _srcRelation._id = `r_${_destBlock._id}`
    // add block to the mergedBlocks return array
    _mergedDocs.push(_srcBlock)
    // remove srcBlock from table so it doesn't overwrite destBlock during merge
    srcDbTables[tableToMerge].delete(_srcBlock._id)
  }

  return _mergedDocs
}

function mergeInlines({
  srcRelation,
  srcDbTables,
  srcBlock,
  destBlock,
  tableToMerge,
}: {
  srcRelation: BlockRelation
  srcDbTables: DbTables
  srcBlock: Block
  destBlock: Block
  tableToMerge: keyof DbTables
}) {
  srcRelation.pages.forEach((_pageId) => {
    const _page = srcDbTables.pages.get(_pageId)
    if (!_page) {
      console.warn('[mergeRelations] missing page', _pageId)
      return
    }
    // console.log('[mergeRelations] process page', _page.name)
    _page!.blocks.forEach((_blockRef) => {
      // if blockRef matches srcBlock, it is a header for the source/topic we are merging,
      // so rewrite its id to match destBlock
      if (_blockRef._id === srcBlock._id) {
        _blockRef._id = destBlock._id
      }

      // otherwise, check the entry for inline instances of srcBlock
      else if (_blockRef.type === BlockType.Entry) {
        const _srcEntry = srcDbTables.entries.get(_blockRef._id)
        if (!_srcEntry) {
          console.warn('[mergeRelations] block not found', _blockRef._id)
          return
        }
        const _updatedEntry = updateInlinesInBlock({
          block: _srcEntry,
          inlineType: tableKeyToInlineType[tableToMerge],
          text: destBlock.text,
          inlineId: srcBlock._id,
          changeInlineIdTo: destBlock._id,
        })
        if (_updatedEntry) {
          srcDbTables.entries.set(_srcEntry._id, _updatedEntry)
          //   console.log(
          //     '[mergeRelations] before updateInlines',
          //     JSON.stringify(_srcEntry, null, 2)
          //   )
          //   console.log(
          //     '[mergeRelations] after updateInlines',
          //     JSON.stringify(_updatedEntry, null, 2)
          //   )
        }
      }
    })
  })
}

export async function handleImport(sourceTables: DbTables) {
  console.log(`[DB] import as new Databyss`)
  // get groupid from user_preference
  const _group = getOrCreateAdminGroup(sourceTables)
  const _groupId = _group._id
  console.log('[DB] found groupid', _groupId)
  const groups = (appState.get('localGroups') ?? []) as Group[]
  const _existingGroup = groups.find((group) => group._id === _groupId)
  if (_existingGroup) {
    sendCommandToBrowser('notify', {
      message: `Cannot import Databyss because it already exists as "${_existingGroup.name}". If you are sure this is correct, you must remove the existing Databyss named "${_existingGroup.name}" before importing the selected file.`,
      error: true,
    })
    return false
  }
  // init pouchdb with groupid as path
  const windowId = BrowserWindow.getFocusedWindow().id
  await initNodeDb(windowId, _groupId)

  // import all the docs
  const res = await nodeDbRefs[windowId].current.bulkDocs(
    Array.from(sourceTables._docsById.values()),
    { new_edits: false } // not change revision
  )
  // flag all group docs as imported if they don't belong to admin
  for (const _group of sourceTables.groups.values()) {
    if (((_group as unknown) as DbDocument).belongsToGroup === _groupId) {
      continue
    }
    _group.isImportedGroup = true
    await nodeDbRefs[windowId].current.upsert(_group._id, () => _group)
    console.log('[handleImport] updated group', _group)
  }

  // add group doc to db if we had to create a new one
  if (!sourceTables._docsById.get(_groupId)) {
    await nodeDbRefs[windowId].current.put(
      addTimeStamp({
        doctype: DocumentType.Group,
        ..._group,
      })
    )
  }

  // add GROUP doc to app state
  appState.set('localGroups', [...groups, _group])
  return true
}

export async function handleImportMedia(
  sourceTables: DbTables,
  importFromPath?: string,
  dbRef?: NodeDbRef
) {
  let _zip: JSZip | null = null
  if (importFromPath?.endsWith('.zip')) {
    const _zipData = fs.readFileSync(importFromPath)
    _zip = await JSZip.loadAsync(_zipData)
  }
  const _groupId = getGroupIdFromTables(sourceTables)
  // ensure local media path
  const _groupMediaPath = path.join(mediaPath(), _groupId)
  fs.ensureDirSync(_groupMediaPath)

  // copy media for all embeds
  for (const _embed of sourceTables.embeds.values()) {
    if (!_embed.detail.fileDetail) {
      continue
    }
    const _filename = _embed.detail.fileDetail.filename
    const _copyToDir = path.join(_groupMediaPath, _embed._id)
    fs.ensureDirSync(_copyToDir)
    const _copyToPath = path.join(_copyToDir, _filename)
    if (importFromPath) {
      // media is local
      const _copyFromDir = _zip ? 'media' : path.join(importFromPath, 'media')
      const _copyFromPath = path.join(_copyFromDir, _embed._id, _filename)
      if (_zip) {
        const _mediaFile = _zip.file(_copyFromPath)
        if (!_mediaFile) {
          console.warn(
            '[handleImportMedia] file not found in zip',
            _copyFromPath
          )
          continue
        }
        const _mediaFileData = await _mediaFile.async('nodebuffer')
        console.log('[handleImportMedia] extracting', _copyFromPath)
        fs.writeFileSync(_copyToPath, _mediaFileData)
      } else {
        fs.copyFileSync(_copyFromPath, _copyToPath)
      }
    } else {
      // fetch media from remote
      const _url = `${process.env.DBFILE_URL}${_groupId}/media/${_embed._id}/${_filename}`
      const _res = await fetch(_url)
      const _buf = await _res.arrayBuffer()
      fs.writeFileSync(_copyToPath, Buffer.from(_buf))

      // rewrite src to indicate local media
      _embed.detail.src = `dbdrive://${_groupId}/${_embed._id}/${_filename}`
      await dbRef!.current!.upsert(_embed._id, () => _embed)
    }
  }
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
  const _dbPath = path.join(_dbDirPath, groupId)
  const _db = new PouchDB(_dbPath)
  const _dbRef: NodeDbRef = {
    current: _db,
    groupId,
    dbPath: _dbPath,
  }
  await exportDbToZip(_dbRef)
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
