import PouchDB from 'pouchdb-node'
import { ipcMain } from 'electron'

interface DbRef {
  current: PouchDB.Database<any> | null
}

export const dbRef: DbRef = {
  current: null,
}

export function initPouchDb() {
  dbRef.current = new PouchDB('databyss-pouchdb')
  ipcMain.handle('db-info', async () => await dbRef.current.info())
  ipcMain.handle('db-allDocs', async () => await dbRef.current.allDocs())
}
