import PouchDB from 'pouchdb-browser'

PouchDB.plugin(require('pouchdb-find').default)
PouchDB.plugin(require('pouchdb-upsert'))

export const db = new PouchDB('local')

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
