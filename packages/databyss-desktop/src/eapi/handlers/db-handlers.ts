import { BrowserWindow, ipcMain } from 'electron'
import { getWindowIdForGroup, initNodeDb, NodeDbRef, nodeDbRefs, setGroupLoaded } from '../../nodeDb'
import { sleep } from '@databyss-org/services/lib/util'
import { updateInlines } from '@databyss-org/data/nodedb/updateInlines'
import { BlockRelation, BlockType } from '@databyss-org/services/interfaces'
import { addTimeStamp } from '@databyss-org/data/pouchdb/docUtils'
import { DocumentType } from '@databyss-org/data/pouchdb/interfaces'

export async function upsertRelation(windowId: number, {
    blockId,
    blockType,
    pageId,
  }: { blockId: string; blockType: BlockType; pageId: string },
  operation: 'add' | 'remove'
) {
  let _updatedRelation: BlockRelation
  const _id = `r_${blockId}`
  await nodeDbRefs[windowId].current.upsert(_id, (oldDoc: BlockRelation) => {
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
      belongsToGroup: nodeDbRefs[windowId].groupId,
      doctype: DocumentType.BlockRelation,
    })
    return _updatedRelation
  })
  return _updatedRelation
}

export function registerDbHandlers() {
  ipcMain.handle('db-info', async (evt) => 
    await nodeDbRefs[evt.sender.id]?.current?.info())
  ipcMain.on('db-loadGroup', async (evt, groupId: string) => {
    console.log('[DB] loadGroup', groupId)
    const _windowId = getWindowIdForGroup(groupId)
    if (_windowId) {
      const _win = BrowserWindow.fromId(_windowId)
      _win.show()
      _win.focus()
      return
    }
    await initNodeDb(evt.sender.id, groupId)
    setGroupLoaded(evt.sender.id)
  })
  ipcMain.handle(
    'db-get',
    async (evt, ...args: Parameters<PouchDB.Database['get']>) => {
      // return await nodeDbRef.current?.get(...args)
      // let res = null
      let attempts = 0
      let lastErr = null
      do {
        attempts += 1
        try {
          return await nodeDbRefs[evt.sender.id]?.current?.get(...args)
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
    async (evt, ...args: Parameters<PouchDB.Database['put']>) => {
      // console.log('[DB] put', args)
      return await nodeDbRefs[evt.sender.id]?.current?.put(...args)
    }
  )
  ipcMain.handle(
    'db-allDocs', 
    async (evt, options: PouchDB.Core.AllDocsOptions) => 
      await nodeDbRefs[evt.sender.id]?.current?.allDocs(options)
  )
  ipcMain.handle(
    'db-bulkGet',
    async (evt, options: PouchDB.Core.BulkGetOptions) =>
      await nodeDbRefs[evt.sender.id]?.current?.bulkGet(options)
  )
  ipcMain.handle(
    'db-upsert',
    async (evt, id: string, doc: object) =>
      await nodeDbRefs[evt.sender.id]?.current?.upsert(id, (oldDoc) => {
        return { ...oldDoc, ...doc }
      })
  )
  ipcMain.handle(
    'db-bulkDocs',
    async (evt, ...args: Parameters<PouchDB.Database['bulkDocs']>) =>
      await nodeDbRefs[evt.sender.id]?.current?.bulkDocs(...args)
  )
  ipcMain.handle(
    'db-find',
    async (evt, ...args: Parameters<PouchDB.Database['find']>) =>
      await nodeDbRefs[evt.sender.id]?.current?.find(...args)
  )
  ipcMain.handle(
    'db-search',
    async (evt, ...args: Parameters<PouchDB.Database['search']>) => {
      console.log('[DB] search', args)
      const res = await nodeDbRefs[evt.sender.id]?.current?.search(...args)
      console.log('[DB] search results', res)
      return res
    }
  )
  ipcMain.on(
    'db-updateInlines',
    (evt, args: Parameters<typeof updateInlines>[1]) => {
      // console.log('[DB] updateInlines', args)
      updateInlines(evt.sender.id, args)
    }
  )
  ipcMain.handle(
    'db-addRelation',
    async (evt, payload: Parameters<typeof upsertRelation>[1]) => {
      return await upsertRelation(evt.sender.id, payload, 'add')
    }
  )
  ipcMain.handle(
    'db-removeRelation',
    async (evt, payload: Parameters<typeof upsertRelation>[1]) => {
      return await upsertRelation(evt.sender.id, payload, 'remove')
    }
  )
}
