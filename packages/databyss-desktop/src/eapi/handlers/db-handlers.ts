import { BrowserWindow, ipcMain } from 'electron'
import {
  getWindowIdForGroup,
  initNodeDb,
  NodeDbRef,
  nodeDbRefs,
  setGroupLoaded,
} from '../../nodeDb'
import { sleep } from '@databyss-org/services/lib/util'
import { updateInlines } from '@databyss-org/data/nodedb/updateInlines'
import { BlockRelation, BlockType } from '@databyss-org/services/interfaces'
import { addTimeStamp } from '@databyss-org/data/pouchdb/docUtils'
import { DocumentType } from '@databyss-org/data/pouchdb/interfaces'

export async function upsertRelation(
  windowId: number,
  {
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
  ipcMain.handle(
    'db-info',
    async (evt) => await nodeDbRefs[evt.sender.id]?.current?.info()
  )
  ipcMain.handle(
    'db-groupId',
    async (evt) => await nodeDbRefs[evt.sender.id]?.groupId
  )
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
    async (evt, ...args: Parameters<PouchDB.Database['bulkDocs']>) => {
      // compose bulk get request
      const _bulkGetQuery = { docs: args[0].map((d) => ({ id: d._id })) }
      if (!_bulkGetQuery.docs.length) {
        return
      }
      const _res = await nodeDbRefs[evt.sender.id]?.current?.bulkGet(
        _bulkGetQuery
      )
      // build old document index
      const _oldDocs: any = {}
      if (_res.results?.length) {
        _res.results.forEach((oldDocRes) => {
          const _docResponse = oldDocRes.docs?.[0] as any
          if (_docResponse?.ok) {
            const _oldDoc = _docResponse.ok
            _oldDocs[_oldDoc._id] = _oldDoc
          }
        })
      }
      // compose updated documents to bulk upsert
      const _docs: any = []
      for (const _doc of args[0]) {
        const { _id, ...docFields } = _doc
        const _oldDoc = _oldDocs[_id]
        if (_oldDoc) {
          _docs.push({
            ..._oldDoc,
            ...docFields,
            ...(_oldDoc._rev ? { _rev: _oldDoc._rev } : {}),
          })
        } else {
          _docs.push(_doc)
        }
      }
      await nodeDbRefs[evt.sender.id]?.current?.bulkDocs(_docs, args[1])
    }
  )
  ipcMain.handle(
    'db-find',
    async (evt, ...args: Parameters<PouchDB.Database['find']>) =>
      await nodeDbRefs[evt.sender.id]?.current?.find(...args)
  )
  ipcMain.handle(
    'db-search',
    async (evt, ...args: Parameters<PouchDB.Database['search']>) => {
      const res = await nodeDbRefs[evt.sender.id]?.current?.search(...args)
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
