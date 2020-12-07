import PouchDB from 'pouchdb'

PouchDB.plugin(require('pouchdb-find').default)

const localDbName = 'test_ibm_1'
const remoteUrl = `https://9cd55e3f-315b-420d-aa03-418d20aae3dd-bluemix.cloudantnosqldb.appdomain.cloud`

/*
his.db = new PouchDB('mytestdb');
    this.username = 'API KEY';
    this.password = 'API PASSWORD';
    this.remote = 'https://MY-BLUEMIX-URL-bluemix.cloudant.com/mytestdb';

    let options = {
      live: true,
      retry: true,
      continuous: true,
      auth: {
        username: this.username,
        password: this.password
      }
    };

    this.db.sync(this.remote, options);
    */

const sync = (db: PouchDB.Database, groupIds: string[]) => {
  const opts = {
    live: true,
    retry: true,
    continuous: true,
    auth: {
      username: 'apikey-f7f4a10fa293451681edce6afe709cd8',
      password: '61b70c6a848b6f2af0f61131cb204e6aaf76f0e5',
    },
  }
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
