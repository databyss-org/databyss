import { ipcMain } from 'electron'
import { initNodeDb, nodeDbRef, setGroupLoaded } from '../../nodeDb'

export function registerDbHandlers() {
  ipcMain.handle('db-info', async () => await nodeDbRef.current?.info())
  ipcMain.on('db-loadGroup', (_, groupId: string) => {
    console.log('[DB] loadGroup', groupId)
    initNodeDb(groupId)
    setGroupLoaded()
  })
  ipcMain.handle(
    'db-get',
    async (_, ...args: Parameters<typeof nodeDbRef.current.get>) => {
      console.log('[DB] get', args)
      return await nodeDbRef.current?.get(...args)
    }
  )
  ipcMain.handle(
    'db-put',
    async (_, ...args: Parameters<typeof nodeDbRef.current.put>) => {
      console.log('[DB] put', args)
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
}
