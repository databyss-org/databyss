import PouchDB from 'pouchdb-browser'
import PouchDBFind from 'pouchdb-find'
import PouchDBUpsert from 'pouchdb-upsert'

// import { DbPage } from './interfaces'
// import { Selection } from '../interfaces/Selection'
// import { Source, Topic } from '../interfaces/Block'

PouchDB.plugin(PouchDBFind)

PouchDB.plugin(PouchDBUpsert)

export const db: PouchDB.Database<any> = new PouchDB('local')

// // EXTENDS documentscope to include upsert
// declare module 'PouchDb' {
//   interface DocumentScope<D> {
//     upsert: (docname: string, callback: (oldDocument: D) => D) => D
//   }
// }

// sample initial page

db.changes({
  since: 0,
  include_docs: true,
}).then((changes) => {
  console.log('DATABASE.CHANGE', changes)
})
