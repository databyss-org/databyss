import PouchDB from 'pouchdb-browser'
// import PouchDB from 'pouchdb'
import PouchDBFind from 'pouchdb-find'
import PouchDBUpsert from 'pouchdb-upsert'
import PouchDbQuickSearch from 'pouchdb-quick-search'

const REMOTE_URL = `https://9cd55e3f-315b-420d-aa03-418d20aae3dd-bluemix.cloudantnosqldb.appdomain.cloud/`

// add plugins
PouchDB.plugin(PouchDbQuickSearch)

PouchDB.plugin(PouchDBFind)

PouchDB.plugin(PouchDBUpsert)

export const db: PouchDB.Database<any> = new PouchDB('local')

db.search({
  fields: ['text.textValue'],
  build: true,
})

db.createIndex({
  index: {
    fields: ['_id'],
  },
})

db.createIndex({
  index: {
    fields: ['$type'],
  },
})

db.createIndex({
  index: {
    fields: ['$type', '_id'],
  },
})

db.createIndex({
  index: {
    fields: ['$type', 'relatedBlock'],
  },
})

db.createIndex({
  index: {
    fields: ['$type', 'page'],
  },
})

db.createIndex({
  index: {
    fields: ['$type', 'blocks'],
  },
})

db.createIndex({
  index: {
    fields: ['block', 'relatedBlock'],
  },
})

db.createIndex({
  index: {
    fields: ['$type', 'relatedBlock'],
  },
})

db.createIndex({
  index: {
    fields: ['$type', 'page'],
  },
})

db.createIndex({
  index: {
    fields: ['$type', 'type'],
  },
})

db.createIndex({
  index: {
    fields: ['$type', 'relatedBlock', 'relationshipType'],
  },
})

db.createIndex({
  index: {
    fields: ['$type', 'relatedBlock', 'block'],
  },
})

export const addTimeStamp = (oldDoc: any): any => {
  // if document has been created add a modifiedAt timestamp
  if (oldDoc.createdAt) {
    return { ...oldDoc, modifiedAt: Date.now() }
  }
  return { ...oldDoc, createdAt: Date.now() }
}

/*
replicates remote DB to local
*/

export const replicateDbFromRemote = ({
  dbKey,
  dbPassword,
  groupId,
}: {
  dbKey: string
  dbPassword: string
  groupId: string
}) =>
  new Promise((resolve, reject) => {
    const opts = {
      // live: true,
      retry: true,
      // continuous: true,
      auth: {
        username: dbKey,
        password: dbPassword,
      },
    }
    db.replicate
      .from(`${REMOTE_URL}/g_${groupId}`, { ...opts })
      .on('complete', () => resolve())
      .on('error', (err) => reject(err))
  })

export const syncPouchDb = ({
  dbKey,
  dbPassword,
  groupId,
}: {
  dbKey: string
  dbPassword: string
  groupId: string
}) => {
  const opts = {
    live: true,
    retry: true,
    continuous: true,
    auth: {
      username: dbKey,
      password: dbPassword,
    },
  }

  db.replicate.to(`${REMOTE_URL}/g_${groupId}`, {
    ...opts,
    // todo: add groupId to every document
    // filter: (doc) => doc.groupId === groupId,
  })
  // .on('error', (err) => console.log(err))
  // .on('change', (info) => console.log('changing TO', info))
  // .on('complete', () => console.log('FINSIHED SYNCING TO'))

  db.replicate.from(`${REMOTE_URL}/g_${groupId}`, { ...opts })
  // .on('complete', () => console.log('FINSIHED SYNCING FROM'))
  // .on('change', (info) => console.log('changing FROM', info))
  // .on('error', (err) => console.log(err))
}
