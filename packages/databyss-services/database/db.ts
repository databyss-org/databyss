import PouchDB from 'pouchdb-browser'
import PouchDBFind from 'pouchdb-find'
import PouchDBUpsert from 'pouchdb-upsert'

PouchDB.plugin(PouchDBFind)

PouchDB.plugin(PouchDBUpsert)

export const db: PouchDB.Database<any> = new PouchDB('local')

db.changes({
  since: 0,
  include_docs: true,
}).then((changes) => {
  console.log('DATABASE.CHANGE', changes)
})
