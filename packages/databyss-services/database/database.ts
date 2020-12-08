import PouchDB from 'pouchdb'

PouchDB.plugin(require('pouchdb-find').default)
PouchDB.plugin(require('pouchdb-upsert'))

const localDbName = 'http://localhost:5985/test_db'

export const createDB = () => {
  const _db = new PouchDB(localDbName)
  return _db
}
