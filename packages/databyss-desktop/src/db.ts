import PouchDB from 'pouchdb-node'
import PouchDBFind from 'pouchdb-find'
import PouchDBUpsert from 'pouchdb-upsert'
// import PouchDbQuickSearch from 'pouchdb-quick-search'
import { ipcMain, dialog, app } from 'electron'
import path from 'path'
import fs from 'fs'

PouchDB.plugin(PouchDBFind)
PouchDB.plugin(PouchDBUpsert)

interface DbRef {
  current: PouchDB.Database<any> | null
  dbPath: string | null
}

export const dbRef: DbRef = {
  current: null,
  dbPath: null,
}

export async function handleImport(filePath: string) {
  console.log('[DB] import', filePath)
  const buf = fs.readFileSync(filePath)
  const res = await dbRef.current.bulkDocs(
    JSON.parse(buf.toString()),
    { new_edits: false }, // not change revision
    (error, result) => {
      if (error) {
        console.log('[DB] import error', error)
        return
      }
      console.log('[DB] import succcess', result)
    }
  )
  console.log('[DB] import done', res)
}

export function initPouchDb() {
  dbRef.dbPath = path.join(app.getPath('userData'), 'defaultdb')
  console.log('[DB] db path', dbRef.dbPath)
  dbRef.current = new PouchDB(dbRef.dbPath)
  ipcMain.handle('db-info', async () => await dbRef.current.info())
  ipcMain.handle(
    'db-get',
    async (_, ...args: Parameters<typeof dbRef.current.get>) => {
      console.log('[DB] get', args)
      return await dbRef.current.get(...args)
    }
  )
  ipcMain.handle('db-allDocs', async () => await dbRef.current.allDocs())
  ipcMain.handle(
    'db-bulkGet',
    async (_, options: PouchDB.Core.BulkGetOptions) =>
      await dbRef.current.bulkGet(options)
  )
  ipcMain.handle(
    'db-upsert',
    async (_, ...args: Parameters<typeof dbRef.current.upsert>) =>
      await dbRef.current.upsert(...args)
  )
  ipcMain.handle(
    'db-find',
    async (_, ...args: Parameters<typeof dbRef.current.find>) =>
      await dbRef.current.find(...args)
  )
  ipcMain.handle(
    'file-open',
    async (_, args) => await dialog.showOpenDialog({ properties: ['openFile'] })
  )
}
