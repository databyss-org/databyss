import PouchDB from 'pouchdb-browser'
// import PouchDB from 'pouchdb'
import PouchDBFind from 'pouchdb-find'
import PouchDBUpsert from 'pouchdb-upsert'
import PouchDbQuickSearch from 'pouchdb-quick-search'
import PouchDBTransform from 'transform-pouch'
import { sourceSchema, textSchema } from '@databyss-org/data/schemas'
import tv4 from 'tv4'
import { BlockType, DocumentType } from '../interfaces/Block'

const REMOTE_URL = `https://9cd55e3f-315b-420d-aa03-418d20aae3dd-bluemix.cloudantnosqldb.appdomain.cloud/`

// add plugins
PouchDB.plugin(PouchDBTransform)
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

  db.replicate
    .to(`${REMOTE_URL}/g_${groupId}`, {
      ...opts,
      // todo: add groupId to every document
      // filter: (doc) => doc.groupId === groupId,
    })
    .on('error', (err) => console.log(`REPLICATE.TO ERROR - ${err}`))

  db.replicate
    .from(`${REMOTE_URL}/g_${groupId}`, { ...opts })
    .on('error', (err) => console.log(`REPLICATE.from ERROR - ${err}`))
}

// pouchDB validator

const _validatorSchemas = [BlockType.Source, sourceSchema]

tv4.addSchema('text', textSchema)

db.transform({
  outgoing: (doc) => {
    // _validatorSchemas.forEach((s) => {
    //   if (doc.type === s[0]) {
    //     if (!tv4.validate(doc, s[1], false, true)) {
    //       console.error(`${s[1].title} - ${tv4.error.message}`)
    //     }
    //   }
    // })
    if (doc.type === BlockType.Source) {
      if (!tv4.validate(doc, sourceSchema, false, true)) {
        console.error(
          `${sourceSchema.title} - ${tv4.error.message} -> ${tv4.error.dataPath}`
        )
      }
    }
    // if (doc.type === BlockType.Entry) {
    //   if (!tv4.validate(doc, entrySchema)) {
    //     console.error(tv4.error.message)
    //   }
    // }
    // if (doc.type === DocumentType.Page) {
    //   if (!tv4.validate(doc, pageSchema)) {
    //     console.error(tv4.error.message)
    //   }
    // }
    // if (doc.type === DocumentType.Selection) {
    //   if (!tv4.validate(doc, selectionSchema)) {
    //     console.error(tv4.error.message)
    //   }
    // }
    // if (doc.type === DocumentType.BlockRelation) {
    //   if (!tv4.validate(doc, blockRelationsSchema)) {
    //     console.error(tv4.error.message)
    //   }
    // }
    // do something to the document after retrieval
    return doc
  },
})
