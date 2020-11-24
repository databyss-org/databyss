import PouchDB from 'pouchdb'

PouchDB.plugin(require('pouchdb-find').default)

const dbname = 'test6'
const remoteUrl = `http://localhost:5001/${dbname}`

const sync = (db: PouchDB.Database) => {
  const opts = { live: true }
  db.replicate.to(remoteUrl, opts)
  db.replicate.from(remoteUrl, opts)
}

const addIndexes = (db: PouchDB.Database) => {
  console.log('addIndexes', db)
  db.createIndex({
    index: { fields: ['$type'] },
  })
}

export const create = () => {
  const _db = new PouchDB(dbname)
  sync(_db)
  addIndexes(_db)
  return _db
}
