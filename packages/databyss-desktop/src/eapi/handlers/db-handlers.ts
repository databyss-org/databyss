import { ipcMain } from 'electron'
import { initNodeDb, nodeDbRef, setGroupLoaded } from '../../nodeDb'
import { sleep } from '@databyss-org/services/lib/util'
import { updateInlines } from '@databyss-org/data/nodedb/updateInlines'
import { BlockRelation, BlockType } from '@databyss-org/services/interfaces'
import { addTimeStamp } from '@databyss-org/data/pouchdb/docUtils'
import { DocumentType } from '@databyss-org/data/pouchdb/interfaces'

export async function upsertRelation(
  {
    blockId,
    blockType,
    pageId,
  }: { blockId: string; blockType: BlockType; pageId: string },
  operation: 'add' | 'remove'
) {
  let _updatedRelation: BlockRelation
  const _id = `r_${blockId}`
  await nodeDbRef.current.upsert(_id, (oldDoc: BlockRelation) => {
    let _pageIds = [...(oldDoc?.pages ?? [])]
    if (operation === 'add') {
      if (!_pageIds.includes(pageId)) {
        _pageIds.push(pageId)
      }
    } else {
      _pageIds = _pageIds.filter((p) => p !== pageId)
    }
    _updatedRelation = addTimeStamp({
      ...(oldDoc ?? {}),
      _id,
      blockId,
      blockType,
      pages: _pageIds,
      belongsToGroup: nodeDbRef.groupId,
      doctype: DocumentType.BlockRelation,
    })
    return _updatedRelation
  })
  return _updatedRelation
}

export function registerDbHandlers() {
  ipcMain.handle('db-info', async () => await nodeDbRef.current?.info())
  ipcMain.on('db-loadGroup', (_, groupId: string) => {
    // console.log('[DB] loadGroup', groupId)
    initNodeDb(groupId)
    setGroupLoaded()
  })
  ipcMain.handle(
    'db-get',
    async (_, ...args: Parameters<typeof nodeDbRef.current.get>) => {
      // return await nodeDbRef.current?.get(...args)
      // let res = null
      let attempts = 0
      let lastErr = null
      do {
        attempts += 1
        try {
          return await nodeDbRef.current?.get(...args)
        } catch (e) {
          lastErr = e
        }
        await sleep(500)
      } while (attempts < 10)
      console.error(attempts, lastErr)
      return null
    }
  )
  ipcMain.handle(
    'db-put',
    async (_, ...args: Parameters<typeof nodeDbRef.current.put>) => {
      // console.log('[DB] put', args)
      return await nodeDbRef.current?.put(...args)
    }
  )
  ipcMain.handle('db-allDocs', async () => await nodeDbRef.current?.allDocs())
  ipcMain.handle(
    'db-bulkGet',
    async (_, options: PouchDB.Core.BulkGetOptions) =>
      await nodeDbRef.current?.bulkGet(options)
  )
  ipcMain.handle(
    'db-upsert',
    async (_, id: string, doc: object) =>
      await nodeDbRef.current?.upsert(id, (oldDoc) => {
        return { ...oldDoc, ...doc }
      })
  )
  ipcMain.handle(
    'db-bulkDocs',
    async (_, ...args: Parameters<typeof nodeDbRef.current.bulkDocs>) =>
      await nodeDbRef.current?.bulkDocs(...args)
  )
  ipcMain.handle(
    'db-find',
    async (_, ...args: Parameters<typeof nodeDbRef.current.find>) =>
      await nodeDbRef.current?.find(...args)
  )
  ipcMain.handle(
    'db-search',
    async (_, ...args: Parameters<typeof nodeDbRef.current.search>) => {
      console.log('[DB] search', args)
      const res = await nodeDbRef.current?.search(...args)
      console.log('[DB] search results', res)
      return res
    }
  )
  ipcMain.on(
    'db-updateInlines',
    (_, ...args: Parameters<typeof updateInlines>) => {
      // console.log('[DB] updateInlines', args)
      updateInlines(...args)
    }
  )
  ipcMain.handle(
    'db-addRelation',
    async (_, payload: Parameters<typeof upsertRelation>[0]) => {
      return await upsertRelation(payload, 'add')
    }
  )
  ipcMain.handle(
    'db-removeRelation',
    async (_, payload: Parameters<typeof upsertRelation>[0]) => {
      return await upsertRelation(payload, 'remove')
    }
  )
}
