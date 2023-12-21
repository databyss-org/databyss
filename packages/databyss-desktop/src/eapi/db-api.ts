import PouchDB from 'pouchdb-node'
import { ipcRenderer } from 'electron'
import { updateInlines as updateInlinesFn } from '@databyss-org/data/nodedb/updateInlines'
import { upsertRelation } from './handlers/db-handlers'
import { BlockRelation } from '@databyss-org/services/interfaces'

export const onGroupLoaded = (callback: (groupId: string) => void) =>
  ipcRenderer.on('db-groupLoaded', (_, groupId: string) => callback(groupId))

export const info: PouchDB.Database['info'] = () =>
  ipcRenderer.invoke('db-info')

export const getGroupId = async () => {
  const dbPathArr = (await info()).db_name.split('/')
  return dbPathArr[dbPathArr.length - 1]
}
export const loadGroup = (groupId: string) => {
  ipcRenderer.send('db-loadGroup', groupId)
}

export const allDocs: PouchDB.Database['allDocs'] = (
  ...args: Parameters<PouchDB.Database['allDocs']>
) => ipcRenderer.invoke('db-allDocs', ...args)

export const get: PouchDB.Database['get'] = (
  ...args: Parameters<PouchDB.Database['get']>
) => ipcRenderer.invoke('db-get', ...args)

export const put: PouchDB.Database['put'] = (
  ...args: Parameters<PouchDB.Database['put']>
) => ipcRenderer.invoke('db-put', ...args)

export const bulkGet: PouchDB.Database['bulkGet'] = (
  ...args: Parameters<PouchDB.Database['bulkGet']>
) => ipcRenderer.invoke('db-bulkGet', ...args)

export const upsert = (
  id: string,
  doc: object
): Promise<PouchDB.UpsertResponse> => ipcRenderer.invoke('db-upsert', id, doc)

export const bulkDocs: PouchDB.Database['bulkDocs'] = (
  ...args: Parameters<PouchDB.Database['bulkDocs']>
) => ipcRenderer.invoke('db-bulkDocs', ...args)

export const find: PouchDB.Database['find'] = (
  ...args: Parameters<PouchDB.Database['find']>
) => ipcRenderer.invoke('db-find', ...args)

export const search: PouchDB.Database['search'] = (
  ...args: Parameters<PouchDB.Database['search']>
) => ipcRenderer.invoke('db-search', ...args)

export const updateInlines = (...args: Parameters<typeof updateInlinesFn>) =>
  ipcRenderer.send('db-updateInlines', ...args)

export const addRelation = (
  payload: Parameters<typeof upsertRelation>[0]
): Promise<BlockRelation> => ipcRenderer.invoke('db-addRelation', payload)

export const removeRelation = (payload: Parameters<typeof upsertRelation>[0]) =>
  ipcRenderer.invoke('db-removeRelation', payload)
