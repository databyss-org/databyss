import { app, BrowserWindow, ipcMain } from 'electron'
import {
  buildSearchIndexDb,
  createNodeDb,
  findSearchIndexDb,
  getDbDirPath,
  nodeDbRefs,
} from '../../nodeDb'
import { Block, BlockType, Group } from '@databyss-org/services/interfaces'
import { PageDoc, UserPreference } from '@databyss-org/data/pouchdb/interfaces'
import { getAtomicsFromFrag } from '@databyss-org/services/blocks/related'
import { getR2Client, upload } from '@databyss-org/services/lib/r2'
import { Role } from '@databyss-org/data/interfaces/sysUser'
import { RemoteDbInfo } from '@databyss-org/services/session/utils'

export class PublishingStatus {
  isCancelled: boolean
  isComplete: boolean
  isSuccess: boolean
  isError: boolean
  messageLog: string[]
  lastMessage: string

  constructor() {
    this.isCancelled = false
    this.isComplete = false
    this.isSuccess = false
    this.isError = false
    this.lastMessage = 'Initializing'
    this.messageLog = ['Initializing']
  }
}

const publishingStatusDict: { [statusId: string]: PublishingStatus } = {}

function getStatus(statusId: string) {
  return publishingStatusDict[statusId]
}

async function docIdsRelatedToPage(page: PageDoc, blocks: Block[]) {
  // console.log('[docIdsRelatedToPage]', page, groupId)
  const _pageBlockIds = page.blocks
    .filter((_pb) => !_pb.type?.match(/^END_/))
    .map((_pb) => _pb._id)
  const _blocks = blocks
  const _entryBlocks = _blocks.filter(
    (_block) => _block.type === BlockType.Entry
  )
  const _entryBlockIds = _entryBlocks.map((_b) => _b._id)
  const _relatedBlocks = getAtomicsFromFrag(_blocks)

  // we want to include blockRelations for Links, but not the linked pages
  let _relatedBlockIds = _relatedBlocks
    .filter((_b) => _b.type !== BlockType.Link)
    .map((_b) => _b._id)
  let _relationIds = _relatedBlocks.map((_b) => `r_${_b._id}`)

  return Array.from(
    new Set(
      [page.selection]
        .concat(_entryBlockIds)
        .concat(_relatedBlockIds)
        .concat(_relationIds)
    )
  )
}

interface UpdateStatusMessageOptions {
  statusId: string
  message: string
  replaceLastLogEntry?: boolean
  notify?: boolean
}
function updateStatusMessage({
  statusId,
  message,
  replaceLastLogEntry = false,
  notify = true,
}: UpdateStatusMessageOptions) {
  const _status = publishingStatusDict[statusId]
  if (!_status) {
    return
  }
  _status.lastMessage = message
  if (replaceLastLogEntry) {
    _status.messageLog[_status.messageLog.length - 1] = message
  } else {
    _status.messageLog.push(message)
  }
  if (notify) {
    notifyStatusUpdated(statusId)
  }
}

function notifyStatusUpdated(statusId: string) {
  const _win = BrowserWindow.getFocusedWindow()
  if (_win) {
    _win.webContents.send(
      'publish-statusUpdated',
      statusId,
      publishingStatusDict[statusId]
    )
  }
}

async function publishGroup(
  windowId: number,
  groupId: string,
  statusId: string
) {
  const _status = new PublishingStatus()
  publishingStatusDict[statusId] = _status
  notifyStatusUpdated(statusId)

  const _db = nodeDbRefs[windowId].current!
  const _group: Group = await _db.get(groupId)
  const _relatedDocIds: string[] = []
  let _defaultPageId: string | null = null

  for (let i = 0; i < _group.pages.length; i++) {
    if (_status.isCancelled) {
      return
    }
    const _pageId = _group.pages[i]
    updateStatusMessage({
      statusId,
      message: `Processing page ${i + 1}/${_group.pages.length}`,
      replaceLastLogEntry: true,
    })

    // init default page
    if (!_defaultPageId) {
      _defaultPageId = _pageId
    }
    // get page
    const _page: PageDoc = await _db.get(_pageId)
    // include page in docIds
    _relatedDocIds.push(_pageId)
    // populate the page blocks
    const _blockIdsToGet = _page.blocks.map((_b) => ({ id: _b._id }))
    const _getBlocksRes = await _db.bulkGet({ docs: _blockIdsToGet })
    const _pageBlocks = _getBlocksRes.results
      .map((_d) => (_d.docs[0] as any).ok)
      .filter(Boolean)
    // console.log('[publishGroup] pageBlocks', _pageBlocks)
    // get docids for all related docs
    const _pageRelated = await docIdsRelatedToPage(_page, _pageBlocks)
    _relatedDocIds.push(..._pageRelated)
  }
  // console.log('[publishGroup] _relatedDocIds', _relatedDocIds)

  const _uniqueDocIds = Array.from(new Set(_relatedDocIds))

  if (_status.isCancelled) {
    return
  }
  updateStatusMessage({ statusId, message: `Fetching data to publish...` })

  const _docsToWrite = await _db.bulkGet({
    docs: _uniqueDocIds.map((d) => ({ id: d })),
  })

  if (_status.isCancelled) {
    return
  }
  updateStatusMessage({ statusId, message: `Generating data to publish...` })
  const _dataToWrite = _docsToWrite!.results
    .map((_d) => (_d.docs[0] as any).ok)
    .filter(Boolean)

  _dataToWrite.push(_group)
  // user preference doc
  const _userPreferences = await _db.get<UserPreference>('user_preference')
  _userPreferences.userId = 'local'
  _userPreferences.belongsToGroup = groupId
  _userPreferences.createdAt = Date.now()
  _userPreferences.groups = [
    {
      groupId,
      defaultPageId: _group.defaultPageId ?? _defaultPageId,
      role: Role.ReadOnly,
    },
  ]
  _dataToWrite.push(_userPreferences)

  const _dbJson = JSON.stringify(_dataToWrite, null, 2)
  // console.log('[publishGroup] _dbJson', _dbJson)

  if (_status.isCancelled) {
    return
  }
  updateStatusMessage({
    statusId,
    message: `Exporting search index for ${groupId}`,
  })
  // group db must be imported temporarily to create the search intdex
  console.log('[publishGroup] write temp db')
  const _groupDb = createNodeDb(getDbDirPath(groupId))
  const res = await _groupDb.bulkDocs(
    _dataToWrite,
    { new_edits: false } // not change revision
  )

  // build search index
  await buildSearchIndexDb(_groupDb)
  const _searchIndexDbPath = await findSearchIndexDb(groupId)
  console.log('[publishGroup] search index db path', _searchIndexDbPath)
  const _searchDb = createNodeDb(_searchIndexDbPath)
  const _searchDbAllDocs = await _searchDb.allDocs({ include_docs: true })
  const _searchDbData = _searchDbAllDocs.rows.map((row) => row.doc)
  const _searchDbJson = JSON.stringify(_searchDbData, null, 2)

  // remove temp dbs
  await _searchDb.destroy()
  await _groupDb.destroy()

  if (_status.isCancelled) {
    return
  }
  updateStatusMessage({ statusId, message: `Uploading data...` })

  // Initialize R2
  const _r2creds = {
    accountId: process.env.R2_ACCOUNT_ID,
    accessKeyId: process.env.R2_ACCESS_KEY,
    secretAccessKey: process.env.R2_SECRET_KEY,
  }
  console.log('[publishGroup] r2creds', _r2creds)
  const r2 = getR2Client(_r2creds)

  //upload the dbJson
  const _uploadPathBase = `${groupId}/databyss-db-${groupId.replace('g_', '')}`
  let _uploadRes = await upload({
    client: r2,
    bucketName: 'databyss-public',
    contents: _dbJson,
    destination: `${_uploadPathBase}.json`,
    mimeType: 'application/json',
  })

  if (_status.isCancelled) {
    return
  }
  updateStatusMessage({ statusId, message: `Uploading search index...` })
  _uploadRes = await upload({
    client: r2,
    bucketName: 'databyss-public',
    contents: _searchDbJson,
    destination: `${_uploadPathBase}-search.json`,
    mimeType: 'application/json',
  })

  // generate and upload info obj
  const _dbInfo: RemoteDbInfo = {
    searchMd5: _searchIndexDbPath.split('-').slice(-1)[0],
  }
  console.log('[publishGroup] db info', _dbInfo)
  _uploadRes = await upload({
    client: r2,
    bucketName: 'databyss-public',
    contents: JSON.stringify(_dbInfo),
    destination: `${_uploadPathBase}-info.json`,
    mimeType: 'application/json',
  })

  if (_status.isCancelled) {
    return
  }
  // console.log('[publishGroup] upload response', _uploadRes)
  updateStatusMessage({ statusId, message: `Publish successful` })
  return 'success'
}

async function cancelPublishGroup(statusId: string) {
  const _status = publishingStatusDict[statusId]
  if (!_status) {
    return
  }
  _status.isCancelled = true
  updateStatusMessage({ statusId, message: 'Publishing cancelled by user' })
}

export function registerPublishHandlers() {
  ipcMain.handle('publish-group', (evt, groupId, statusId) =>
    publishGroup(evt.sender.id, groupId, statusId)
  )
  ipcMain.handle('publish-getStatus', (evt, statusId) => getStatus(statusId))
  ipcMain.handle('publish-cancel', (evt, statusId) =>
    cancelPublishGroup(statusId)
  )
}
