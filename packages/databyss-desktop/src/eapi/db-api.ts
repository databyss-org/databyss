import PouchDB from 'pouchdb-node'
import { ipcRenderer } from 'electron'

export const info: PouchDB.Database['info'] = () =>
  ipcRenderer.invoke('db-info')

export const allDocs: PouchDB.Database['allDocs'] = () =>
  ipcRenderer.invoke('db-allDocs')
