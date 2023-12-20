import { ipcMain } from 'electron'
import { initNodeDb, nodeDbRef, setGroupLoaded } from '../../nodeDb'
import { sleep } from '@databyss-org/services/lib/util'

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
      } while (attempts < 4)
      console.error(lastErr)
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
}
