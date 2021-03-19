import PouchDB from 'pouchdb'
import PouchDBFind from 'pouchdb-find'
import PouchDBUpsert from 'pouchdb-upsert'
import PouchDbQuickSearch from 'pouchdb-quick-search'
import PouchDBTransform from 'transform-pouch'
import {
  sourceSchema,
  blockRelationSchema,
  selectionSchema,
  pageSchema,
  groupSchema,
  textSchema,
  entrySchema,
  topicSchema,
  pouchDocSchema,
  blockSchema,
  userPreferenceSchema,
} from '@databyss-org/data/schemas'
import {
  getPouchSecret,
  getDbCredentialsFromLocal,
  getDefaultGroup,
} from '@databyss-org/services/session/clientStorage'
import { BlockType } from '@databyss-org/services/interfaces/Block'
import tv4 from 'tv4'
import { getAccountFromLocation } from '@databyss-org/services/session/_helpers'
import { checkNetwork } from '@databyss-org/services/lib/request'
import { DocumentType } from './interfaces'
import { searchText } from './utils'

export const REMOTE_CLOUDANT_URL = `https://${process.env.CLOUDANT_HOST}`

// add plugins
PouchDB.plugin(PouchDBTransform)
PouchDB.plugin(PouchDbQuickSearch)
PouchDB.plugin(PouchDBFind)
PouchDB.plugin(PouchDBUpsert)

interface DbRef {
  current: PouchDB.Database<any> | null
}

declare global {
  interface IDBFactory {
    databases: () => Promise<{ name: string; version: number }[]>
  }
}

const getPouchDb = (groupId: string) =>
  new PouchDB(groupId, {
    auto_compaction: true,
  })

export const dbRef: DbRef = {
  current: null,
}

// try to load pouch_secrets from local storage to init db
const defaultGroup = getDefaultGroup()
const groupIdFromUrl = getAccountFromLocation()

if (
  defaultGroup &&
  (!groupIdFromUrl || groupIdFromUrl === defaultGroup || process.env.STORYBOOK)
) {
  dbRef.current = getPouchDb(`g_${defaultGroup}`)
}

export const areIndexBuilt = {
  current: false,
}

export const initiatePouchDbIndexes = async () => {
  // await dbRef.current.createIndex({
  //   index: {
  //     fields: ['doctype'],
  //     ddoc: 'fetch-all',
  //   },
  // })

  // await dbRef.current.createIndex({
  //   index: {
  //     fields: ['doctype', '_id'],
  //     ddoc: 'fetch-one',
  //   },
  // })

  // initiate search index
  // await searchText('xxxxxx')

  // await dbRef.current.createIndex({
  //   index: {
  //     fields: ['doctype', 'relatedBlock'],
  //     ddoc: 'block-relations',
  //   },
  // })

  // await dbRef.current.createIndex({
  //   index: {
  //     fields: ['doctype', 'relatedBlock', 'block'],
  //     ddoc: 'block-relation',
  //   },
  // })

  // await dbRef.current.createIndex({
  //   index: {
  //     fields: ['doctype', 'page'],
  //     ddoc: 'block-relations-page',
  //   },
  // })

  // if search index doesnt exist, add search index
  try {
    const _dbs = await window.indexedDB.databases()

    if (!_dbs.find((_db) => _db.name.includes('_pouch_local-search'))) {
      console.log('building search index')
      await searchText('xxxxx')
    }
  } catch (err) {
    console.log(err)
  }
  // await dbRef.current.createIndex({
  //   index: {
  //     fields: ['doctype', 'blocks.[]._id'],
  //     ddoc: 'page-blocks',
  //   },
  // })

  // await dbRef.current.createIndex({
  //   index: {
  //     fields: ['doctype', 'type'],
  //     ddoc: 'fetch-atomic',
  //   },
  // })

  // // THIS INDEX CAN BE OPTIONAL USING THE ABOVE INDEX 'fetch-atomic'
  // await dbRef.current.createIndex({
  //   index: {
  //     fields: ['doctype', 'type', '_id'],
  //     ddoc: 'fetch-atomic-id',
  //   },
  // })

  // await dbRef.current.createIndex({
  //   index: {
  //     fields: ['doctype', 'relatedBlock', 'relationshipType'],
  //     ddoc: 'inline-atomics',
  //   },
  // })

  console.log('indexes built')
  areIndexBuilt.current = true
}

export const resetPouchDb = async () => {
  if (dbRef.current) {
    await (dbRef.current as PouchDB.Database).destroy()
  }

  dbRef.current = null
}

/*
replicates public remote DB to local
*/

export const replicatePublicGroup = ({ groupId }: { groupId: string }) =>
  new Promise<boolean>((resolve, reject) => {
    const opts = {
      retry: true,
    }
    dbRef.current = getPouchDb(groupId)

    dbRef.current.replicate
      .from(`${REMOTE_CLOUDANT_URL}/${groupId}`, {
        ...opts,
      })
      .on('complete', () => {
        const _opts = {
          ...opts,
          live: true,
          continuous: true,
        }
        // when replication is complete, kick off a live sync
        dbRef
          .current!.replicate.from(`${REMOTE_CLOUDANT_URL}/${groupId}`, {
            ..._opts,
          })
          .on('error', () => {
            // user has turned off sharing
            setTimeout(() => {
              // first reset DB then reload
              resetPouchDb().then(() => {
                window.location.reload()
              })
            }, 1000)
          })

        resolve(true)
      })
      .on('error', (err) => {
        reject(err)
      })
  })

/*
replicates remote DB to local
*/

export const replicateDbFromRemote = ({
  // dbKey,
  // dbPassword,
  groupId,
}: {
  // dbKey: string
  // dbPassword: string
  groupId: string
}) =>
  new Promise<Boolean>((resolve, reject) => {
    const _couchUrl = `${REMOTE_CLOUDANT_URL}/g_${groupId}`

    // for now we are getting the first credentials from local storage groups
    const _creds = getPouchSecret()
    // let _dbId
    let _cred

    if (!_creds) {
      reject()
    }
    if (_creds) {
      // _dbId = Object.keys(_creds)[0]
      _cred = _creds[groupId]
    }
    if (!_cred) {
      reject()
    }

    const opts = {
      // live: true,
      retry: true,
      // continuous: true,
      auth: {
        username: _cred.dbKey,
        password: _cred.dbPassword,
      },
    }
    dbRef.current = getPouchDb(`g_${groupId}`)

    checkNetwork().then((isOnline) => {
      if (isOnline) {
        dbRef
          .current!.replicate.from(_couchUrl, {
            ...opts,
          })
          .on('complete', () => resolve(true))
          .on('error', (err) => reject(err))
      } else {
        resolve(false)
      }
    })
  })

export const syncPouchDb = ({
  groupId,
  dispatch,
}: {
  groupId: string
  dispatch: Function
}) => {
  console.log('Start PouchDB <=> Cloudant sync')
  // get credentials from local storage
  const _cred: any = getDbCredentialsFromLocal(groupId)

  if (!_cred) {
    console.error('credentials not found')
  }
  const opts = {
    live: true,
    retry: true,
    continuous: true,
    auth: {
      username: _cred.dbKey,
      password: _cred.dbPassword,
    },
  }

  ;(dbRef.current as PouchDB.Database).replicate
    .to(`${REMOTE_CLOUDANT_URL}/g_${groupId}`, {
      ...opts,
      // do not replciate design docs
      filter: (doc) => !doc._id.includes('design/'),
    })
    .on('error', (err) => console.log(`REPLICATE.TO ERROR - ${err}`))
    .on('change', (info) => {
      dispatch({
        type: 'DB_BUSY',
        payload: {
          isBusy: true,
          writesPending: info.docs.length,
        },
      })
    })
    .on('paused', (err) => {
      if (!err) {
        dispatch({
          type: 'DB_BUSY',
          payload: {
            isBusy: false,
            writesPending: 0,
          },
        })
      }
    })
  ;(dbRef.current as PouchDB.Database).replicate
    .from(`${REMOTE_CLOUDANT_URL}/g_${groupId}`, { ...opts })
    .on('error', (err) => console.log(`REPLICATE.from ERROR - ${err}`))
    .on('change', (info) => {
      dispatch({
        type: 'DB_BUSY',
        payload: {
          isBusy: true,
          readsPending: info.docs.length,
        },
      })
    })
    .on('paused', (err) => {
      if (!err) {
        dispatch({
          type: 'DB_BUSY',
          payload: {
            isBusy: false,
            readsPending: 0,
          },
        })
      }
    })
}

export const pouchDataValidation = (data) => {
  // remove undefined properties
  Object.keys(data).forEach((key) => {
    if (key === '_id' && data[key] === undefined) {
      console.error('invalid data', data)
      throw new Error(`_id is undefined`)
    }

    return data[key] === undefined ? delete data[key] : {}
  })

  // pouchDB validator
  const schemaMap = {
    [BlockType.Source]: sourceSchema,
    [BlockType.Entry]: entrySchema,
    [BlockType.Topic]: topicSchema,
    [DocumentType.Group]: groupSchema,
    [DocumentType.Page]: pageSchema,
    [DocumentType.Selection]: selectionSchema,
    [DocumentType.BlockRelation]: blockRelationSchema,
    [DocumentType.UserPreferences]: userPreferenceSchema,
  }

  // add $ref schemas, these schemas are reused
  tv4.addSchema('text', textSchema)
  tv4.addSchema('pouchDb', pouchDocSchema)
  tv4.addSchema('blockSchema', blockSchema)

  if (data._id.includes('design/')) {
    return
  }
  let schema
  // user database determines the schema by the .type field

  if (data.doctype === DocumentType.Block) {
    schema = schemaMap[data.type]
  } else {
    schema = schemaMap[data.doctype]
  }

  // `this.schema &&` this will be removed when all schemas are implemented
  if (schema && !tv4.validate(data, schema, false, true)) {
    console.log('TYPE', data)
    console.error(
      `${schema.title} - ${tv4.error.message} -> ${tv4.error.dataPath}`
    )
    throw new Error(
      `${schema.title} - ${tv4.error.message} -> ${tv4.error.dataPath}`
    )
  }

  if (!schema) {
    console.log('NOT FOUND', data)
    console.error(`no schema found`)
    throw new Error(
      `${schema.title} - ${tv4.error.message} -> ${tv4.error.dataPath}`
    )
  }
}
