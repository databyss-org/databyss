import { ipcMain } from 'electron'
import { nodeDbRefs } from '../../nodeDb'
import { Block, BlockType, Group } from '@databyss-org/services/interfaces'
import { PageDoc, UserPreference } from '@databyss-org/data/pouchdb/interfaces'
import { getAtomicsFromFrag } from '@databyss-org/services/blocks/related'
import { getR2Client, upload } from '@databyss-org/services/lib/r2'
import { Role } from '@databyss-org/data/interfaces/sysUser'

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

async function publishGroup(windowId: number, groupId: string) {
  const _db = nodeDbRefs[windowId].current!
  const _group: Group = await _db.get(groupId)
  const _relatedDocIds: string[] = []
  let _defaultPageId: string | null = null

  for (const _pageId of _group.pages) {
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

  const _docsToWrite = await _db.bulkGet({
    docs: _uniqueDocIds.map((d) => ({ id: d })),
  })

  const _dataToWrite = _docsToWrite!.results
    .map((_d) => (_d.docs[0] as any).ok)
    .filter(Boolean)

  _dataToWrite.push(_group)
  // user preference doc
  const _userPreferences: UserPreference = {
    _id: 'user_preference',
    userId: 'local',
    belongsToGroup: groupId,
    createdAt: Date.now(),
    groups: [
      {
        groupId,
        defaultPageId: _group.defaultPageId ?? _defaultPageId,
        role: Role.ReadOnly,
      },
    ],
  }
  _dataToWrite.push(_userPreferences)

  const _dbJson = JSON.stringify(_dataToWrite, null, 2)
  // console.log('[publishGroup] _dbJson', _dbJson)

  // Initialize R2
  const _r2creds = {
    accountId: process.env.R2_ACCOUNT_ID,
    accessKeyId: process.env.R2_ACCESS_KEY,
    secretAccessKey: process.env.R2_SECRET_KEY,
  }
  console.log('[publishGroup] r2creds', _r2creds)
  const r2 = getR2Client(_r2creds)

  // // Initialize bucket instance
  // const _bucket = r2.bucket('databyss-public')
  // // Check if the bucket exists
  // console.log('[publishGroup] bucket', await _bucket.exists())

  const _filename = `${groupId}/databyss-db-${groupId.replace('g_', '')}.json`

  //upload the dbJson
  const _uploadRes = await upload({
    client: r2,
    bucketName: 'databyss-public',
    contents: _dbJson,
    destination: _filename,
    mimeType: 'application/json',
  })
  console.log('[publishGroup] upload response', _uploadRes)

  // fileDownload(_dbJson, `databyss-db-${group._id}.json`)
  return 'success'
}

export function registerPublishHandlers() {
  ipcMain.handle('publish-group', (evt, groupId) =>
    publishGroup(evt.sender.id, groupId)
  )
}
