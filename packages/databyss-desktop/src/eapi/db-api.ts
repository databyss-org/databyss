import PouchDB from 'pouchdb-node'
import { ipcRenderer } from 'electron'

export const info: PouchDB.Database['info'] = () =>
  ipcRenderer.invoke('db-info')

export const allDocs: PouchDB.Database['allDocs'] = (
  ...args: Parameters<PouchDB.Database['allDocs']>
) => ipcRenderer.invoke('db-allDocs', ...args)

export const get: PouchDB.Database['get'] = (
  ...args: Parameters<PouchDB.Database['get']>
) => ipcRenderer.invoke('db-get', ...args)

export const bulkGet: PouchDB.Database['bulkGet'] = (
  ...args: Parameters<PouchDB.Database['bulkGet']>
) => ipcRenderer.invoke('db-bulkGet', ...args)

export const upsert = (
  ...args: Parameters<PouchDB.Database['upsert']>
): Promise<PouchDB.UpsertResponse> => ipcRenderer.invoke('db-upsert', ...args)

export const find: PouchDB.Database['find'] = (
  ...args: Parameters<PouchDB.Database['find']>
) => ipcRenderer.invoke('db-find', ...args)
