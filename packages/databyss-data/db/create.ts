import PouchDB from 'pouchdb'

PouchDB.plugin(require('pouchdb-find').default)

const localDbName = 'test8'
const remoteUrl = `http://localhost:5001`

const sync = (db: PouchDB.Database, groupIds: string[]) => {
  const opts = { live: true }
  groupIds.forEach((gid) => {
    db.replicate.to(`${remoteUrl}/${gid}`, {
      ...opts,
      filter: (doc) => doc.groupId === gid,
    })
    db.replicate.from(`${remoteUrl}/${gid}`, opts)
  })
}

const addIndexes = (db: PouchDB.Database) => {
  db.createIndex({
    index: { fields: ['$type'] },
  })
}

export const create = (groupIds: string[]) => {
  const _db = new PouchDB(localDbName)
  sync(_db, groupIds)
  addIndexes(_db)
  return _db
}
