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
import { DocumentType } from './interfaces'
import { searchText, findOne, findAll } from './utils'

export const REMOTE_CLOUDANT_URL = `https://${process.env.CLOUDANT_HOST}`

// add plugins
PouchDB.plugin(PouchDBTransform)
PouchDB.plugin(PouchDbQuickSearch)
PouchDB.plugin(PouchDBFind)
PouchDB.plugin(PouchDBUpsert)

interface DbRef {
  current: { [key: string]: PouchDB.Database<any> }
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
  current: {},
}

// try to load pouch_secrets from local storage to init db
// const _secrets = getPouchSecret()
const defaultGroup = getDefaultGroup()
if (defaultGroup) {
  dbRef.current[defaultGroup] = getPouchDb(`g_${defaultGroup}`)
}

export const areIndexBuilt = {
  current: false,
}

export const initiatePouchDbIndexes = async () => {
  // await dbRef.current.createIndex({
  //   index: {
  //     fields: ['$type'],
  //     ddoc: 'fetch-all',
  //   },
  // })

  // await dbRef.current.createIndex({
  //   index: {
  //     fields: ['$type', '_id'],
  //     ddoc: 'fetch-one',
  //   },
  // })

  // initiate search index
  // await searchText('xxxxxx')

  // await dbRef.current.createIndex({
  //   index: {
  //     fields: ['$type', 'relatedBlock'],
  //     ddoc: 'block-relations',
  //   },
  // })

  // await dbRef.current.createIndex({
  //   index: {
  //     fields: ['$type', 'relatedBlock', 'block'],
  //     ddoc: 'block-relation',
  //   },
  // })

  // await dbRef.current.createIndex({
  //   index: {
  //     fields: ['$type', 'page'],
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
  //     fields: ['$type', 'blocks.[]._id'],
  //     ddoc: 'page-blocks',
  //   },
  // })

  // await dbRef.current.createIndex({
  //   index: {
  //     fields: ['$type', 'type'],
  //     ddoc: 'fetch-atomic',
  //   },
  // })

  // // THIS INDEX CAN BE OPTIONAL USING THE ABOVE INDEX 'fetch-atomic'
  // await dbRef.current.createIndex({
  //   index: {
  //     fields: ['$type', 'type', '_id'],
  //     ddoc: 'fetch-atomic-id',
  //   },
  // })

  // await dbRef.current.createIndex({
  //   index: {
  //     fields: ['$type', 'relatedBlock', 'relationshipType'],
  //     ddoc: 'inline-atomics',
  //   },
  // })

  console.log('indexes built')
  areIndexBuilt.current = true
}

/*
replicates public remote DB to local
*/

export const replicatePublicPage = ({ pageId }: { pageId: string }) =>
  new Promise<boolean>((resolve, reject) => {
    // for now we are getting the first credentials from local storage groups
    const opts = {
      retry: true,
    }
    dbRef.current[pageId] = getPouchDb(pageId)

    console.log('ATTEMPTINGS')
    dbRef.current[pageId].replicate
      .from(`${REMOTE_CLOUDANT_URL}/${pageId}`, {
        ...opts,
      })
      .on('complete', () => resolve(true))
      .on('error', () => {
        resolve(false)
        // console.log('REJECT')
        // reject(err)
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
  new Promise<void>((resolve, reject) => {
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
    dbRef.current[groupId] = getPouchDb(`g_${groupId}`)
    dbRef.current[groupId].replicate
      .from(`${REMOTE_CLOUDANT_URL}/g_${groupId}`, {
        ...opts,
      })
      .on('complete', () => resolve())
      .on('error', (err) => reject(err))
  })

export const syncPouchDb = ({
  // dbKey,
  // dbPassword,
  groupId,
  dispatch,
}: {
  // dbKey: string
  // dbPassword: string
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

  dbRef.current[groupId].replicate
    .to(`${REMOTE_CLOUDANT_URL}/g_${groupId}`, {
      ...opts,
      // do not replciate design docs
      filter: (doc) => !doc._id.includes('design/'),
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

  dbRef.current[groupId].replicate
    .from(`${REMOTE_CLOUDANT_URL}/g_${groupId}`, { ...opts })
    .on('error', (err) => console.log(`REPLICATE.from ERROR - ${err}`))
  // .on('paused', (info) => console.log(`REPLICATE.from done - ${info}`))
}

export const resetPouchDb = async () => {
  const _dbs = Object.keys(dbRef.current)

  _dbs.forEach((_db) => {
    dbRef.current[_db].destroy()
    delete dbRef.current[_db]
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

  if (data.$type === DocumentType.Block) {
    schema = schemaMap[data.type]
  } else {
    schema = schemaMap[data.$type]
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
