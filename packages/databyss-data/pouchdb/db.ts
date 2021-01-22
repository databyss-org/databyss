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
  topicSchema,
  pouchDocSchema,
  blockSchema,
  userPreferenceSchema,
} from '@databyss-org/data/schemas'
import { BlockType } from '@databyss-org/services/interfaces/Block'
import tv4 from 'tv4'
import { JSONSchema4 } from 'json-schema'
import { DocumentType } from './interfaces'

const REMOTE_URL = `https://fa0a57bd-308f-4564-9e4d-e69d68aad000-bluemix.cloudantnosqldb.appdomain.cloud`

// add plugins
PouchDB.plugin(PouchDBTransform)
PouchDB.plugin(PouchDbQuickSearch)
PouchDB.plugin(PouchDBFind)
PouchDB.plugin(PouchDBUpsert)

interface DbRef {
  current: PouchDB.Database<any>
}

export const dbRef: DbRef = {
  current: new PouchDB('local', {
    auto_compaction: true,
  }),
}

export const initiatePouchDbIndexes = async () => {
  await dbRef.current.search({
    fields: ['text.textValue'],
    build: true,
  })

  await dbRef.current.createIndex({
    index: {
      fields: ['_id'],
    },
  })

  await dbRef.current.createIndex({
    index: {
      fields: ['$type'],
    },
  })

  await dbRef.current.createIndex({
    index: {
      fields: ['$type', '_id'],
    },
  })

  await dbRef.current.createIndex({
    index: {
      fields: ['$type', 'relatedBlock'],
    },
  })

  await dbRef.current.createIndex({
    index: {
      fields: ['$type', 'page'],
    },
  })

  await dbRef.current.createIndex({
    index: {
      fields: ['$type', 'blocks'],
    },
  })

  await dbRef.current.createIndex({
    index: {
      fields: ['block', 'relatedBlock'],
    },
  })

  await dbRef.current.createIndex({
    index: {
      fields: ['$type', 'relatedBlock'],
    },
  })

  await dbRef.current.createIndex({
    index: {
      fields: ['$type', 'page'],
    },
  })

  await dbRef.current.createIndex({
    index: {
      fields: ['$type', 'type'],
    },
  })

  await dbRef.current.createIndex({
    index: {
      fields: ['$type', 'relatedBlock', 'relationshipType'],
    },
  })

  await dbRef.current.createIndex({
    index: {
      fields: ['$type', 'relatedBlock', 'block'],
    },
  })
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
    dbRef.current.replicate
      .from(`${REMOTE_URL}/g_${groupId}`, { ...opts })
      .on('complete', () => resolve())
      .on('error', (err) => reject(err))
  })

export const syncPouchDb = ({
  dbKey,
  dbPassword,
  groupId,
  dispatch,
}: {
  dbKey: string
  dbPassword: string
  groupId: string
  dispatch: Function
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
  dbRef.current.replicate
    .to(`${REMOTE_URL}/g_${groupId}`, {
      ...opts,
      // todo: add groupId to every document
      // filter: (doc) => doc.$type !== DocumentType.UserPreferences,
    })
    .on('error', (err) => console.log(`REPLICATE.TO ERROR - ${err}`))
    .on('change', () => {
      dispatch({
        type: 'DB_BUSY',
        payload: {
          isBusy: true,
        },
      })
    })
    .on('paused', (err) => {
      if (!err) {
        dispatch({
          type: 'DB_BUSY',
          payload: {
            isBusy: false,
          },
        })
      }
    })

  dbRef.current.replicate
    .from(`${REMOTE_URL}/g_${groupId}`, { ...opts })
    .on('error', (err) => console.log(`REPLICATE.from ERROR - ${err}`))
  // .on('paused', (info) => console.log(`REPLICATE.from done - ${info}`))
}

export const initiatePouchDbValidators = () => {
  // pouchDB validator
  const _validatorSchemas: Array<[BlockType | DocumentType, JSONSchema4]> = [
    [BlockType.Source, sourceSchema],
    [BlockType.Entry, entrySchema],
    [BlockType.Topic, topicSchema],
    [DocumentType.Page, pageSchema],
    [DocumentType.Selection, selectionSchema],
    [DocumentType.BlockRelation, blockRelationSchema],
    [DocumentType.UserPreferences, userPreferenceSchema],
  ]

  // add $ref schemas, these schemas are reused
  tv4.addSchema('text', textSchema)
  tv4.addSchema('pouchDb', pouchDocSchema)
  tv4.addSchema('blockSchema', blockSchema)

  dbRef.current.transform({
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
}

// TODO MAKE UTILS DIRECTORY HERE

export const resetPouchDb = async () => {
  if (dbRef.current?.destroy) {
    await dbRef.current.destroy()
  }

  dbRef.current = new PouchDB('local', {
    auto_compaction: true,
  })
}
