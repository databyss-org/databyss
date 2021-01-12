import PouchDB from 'pouchdb-browser'
import PouchDBFind from 'pouchdb-find'
import PouchDBUpsert from 'pouchdb-upsert'
import PouchDbQuickSearch from 'pouchdb-quick-search'
import PouchDBTransform from 'transform-pouch'
import {
  sourceSchema,
  blockRelationSchema,
  selectionSchema,
  pageSchema,
  textSchema,
  entrySchema,
} from '@databyss-org/data/schemas'
import { BlockType } from '@databyss-org/services/interfaces/Block'
import tv4 from 'tv4'
import { JSONSchema4 } from 'json-schema'
import pouchDocSchema from '../schemas/pouchDocSchema'
import blockSchema from '../schemas/blockSchema'
import { DocumentType } from './interfaces'

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
const _validatorSchemas: Array<[BlockType | DocumentType, JSONSchema4]> = [
  // ADD topic types
  [BlockType.Source, sourceSchema],
  [BlockType.Entry, entrySchema],
  [DocumentType.Page, pageSchema],
  [DocumentType.Selection, selectionSchema],
  [DocumentType.BlockRelation, blockRelationSchema],
]

// add $ref schemas, these schemas are reused
tv4.addSchema('text', textSchema)
tv4.addSchema('pouchDb', pouchDocSchema)
tv4.addSchema('blockSchema', blockSchema)

db.transform({
  outgoing: (doc) => {
    _validatorSchemas.forEach((s) => {
      if (doc.type === s[0] || doc.$type === s[0]) {
        if (!tv4.validate(doc, s[1], false, true)) {
          console.log('DOCUMENT', doc)
          console.error(
            `${s[1].title} - ${tv4.error.message} -> ${tv4.error.dataPath}`
          )
        }
      }
    })
    return doc
  },
})

// TODO MAKE UTILS DIRECTORY HERE
