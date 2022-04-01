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
  notificationSchema,
  pointSchema,
} from '@databyss-org/data/schemas'
import {
  getPouchSecret,
  getDbCredentialsFromLocal,
  getDefaultGroup,
} from '@databyss-org/services/session/clientStorage'
import { BlockType } from '@databyss-org/services/interfaces/Block'
import tv4 from 'tv4'
import { getAccountFromLocation } from '@databyss-org/services/session/utils'
import { checkNetwork } from '@databyss-org/services/lib/request'
import { DocumentType } from './interfaces'
import { setDbBusyDispatch, setDbBusy } from './utils'
import { processGroupActionQ } from './groups/utils'
import { connect, CouchDb, couchDbRef } from '../couchdb-client/couchdb'
import embedSchema from '../schemas/embedSchema'
import { UnauthorizedDatabaseReplication } from '../../databyss-services/interfaces/Errors'

export const REMOTE_CLOUDANT_URL = `https://${process.env.CLOUDANT_HOST}`

// add plugins
PouchDB.plugin(PouchDBTransform)
PouchDB.plugin(PouchDbQuickSearch)
PouchDB.plugin(PouchDBFind)
PouchDB.plugin(PouchDBUpsert)

interface DbRef {
  current: PouchDB.Database<any> | null
  readOnly: boolean
}

export const getPouchDb = (groupId: string) => {
  if (
    process.env.FORCE_MOBILE?.toLowerCase() === 'true' ||
    process.env.COUCH_DIRECT?.toLowerCase() === 'true'
  ) {
    if (!couchDbRef.current) {
      connect(groupId)
    }
    const _unknown = couchDbRef.current as unknown
    return _unknown as PouchDB.Database
  }
  return new PouchDB(groupId, {
    auto_compaction: true,
  })
}
export const dbRef: DbRef = {
  current: null,
  readOnly: false,
}

// try to load pouch_secrets from local storage to init db
const defaultGroup = getDefaultGroup()
const groupIdFromUrl = getAccountFromLocation()

// if you're logged-in but not on your own group's URL (you're on a public group url, eg),
//   skip initialization of pouchDb - it happens in replicatePublicGroup
if (
  defaultGroup &&
  (!groupIdFromUrl || groupIdFromUrl === defaultGroup || process.env.STORYBOOK)
) {
  dbRef.current = getPouchDb(defaultGroup)
}

export const areIndexBuilt = {
  current: false,
}

export const MakePouchReplicationErrorHandler = (
  action: string,
  logOnly: boolean = false
) => (pouchError: any) => {
  if (pouchError.name === 'forbidden' || pouchError.name === 'unauthorized') {
    if (logOnly) {
      console.log('[UnauthorizedDatabaseReplication]', action)
      return
    }
    throw new UnauthorizedDatabaseReplication(action)
  }
  throw pouchError
}

export const initiatePouchDbIndexes = async () => {
  if (dbRef.current instanceof CouchDb) {
    return
  }

  // TODO: indexing

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
      batch_size: 1000,
    }
    dbRef.current = getPouchDb(groupId)

    dbRef.current?.replicate
      ?.from(`${REMOTE_CLOUDANT_URL}/${groupId}`, {
        ...opts,
      })
      .on(
        'error',
        MakePouchReplicationErrorHandler('[replicatePublicGroup:replicate]')
      )
      .on('complete', () => {
        // console.log('[replicatePublicGroup] complete')
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
          .on('paused', () => {
            resolve(true)
          })
          .on(
            'error',
            MakePouchReplicationErrorHandler('[replicatePublicGroup:sync]')
          )
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
    if (dbRef.current instanceof CouchDb) {
      resolve(true)
      return
    }
    const _couchUrl = `${REMOTE_CLOUDANT_URL}/${groupId}`

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
      batch_size: 1000,
      auth: {
        username: _cred.dbKey,
        password: _cred.dbPassword,
      },
    }
    // console.log('[replicateDbFromRemote]', opts)
    dbRef.current = getPouchDb(groupId)

    checkNetwork().then((isOnline) => {
      if (isOnline) {
        dbRef
          .current!.replicate.from(_couchUrl, {
            ...opts,
          })
          .on(
            'error',
            MakePouchReplicationErrorHandler('[replicateDbFromRemote]')
          )
          .on('complete', () => resolve(true))
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
  if (dbRef.current instanceof CouchDb) {
    return
  }
  console.log('Start PouchDB <=> Cloudant sync')
  // pass  the  session provider dispatch to the patch queue
  setDbBusyDispatch(dispatch)

  // get credentials from local storage
  const _cred: any = getDbCredentialsFromLocal(groupId)

  if (!_cred) {
    console.error('credentials not found')
  }
  const opts = {
    live: true,
    retry: true,
    continuous: true,
    batch_size: 1000,
    auth: {
      username: _cred.dbKey,
      password: _cred.dbPassword,
    },
  }

  ;(dbRef.current as PouchDB.Database).replicate
    .to(`${REMOTE_CLOUDANT_URL}/${groupId}`, {
      ...opts,
      // do not replciate design docs
      filter: (doc) => !doc._id.includes('design/'),
    })
    .on('error', MakePouchReplicationErrorHandler('[syncPouchDb:replicate.to]'))
    .on('change', (info) => {
      setDbBusy(true, info.docs.length)
    })
    .on('paused', (err) => {
      if (!err) {
        setDbBusy(false)

        // when replication has paused, sync group queues
        processGroupActionQ()
      }
    })
  ;(dbRef.current as PouchDB.Database).replicate
    .from(`${REMOTE_CLOUDANT_URL}/${groupId}`, { ...opts })
    .on(
      'error',
      MakePouchReplicationErrorHandler('[syncPouchDb:replicate.from]')
    )
    .on('change', (info) => {
      setDbBusy(true, info.docs.length)
    })
    .on('paused', (err) => {
      if (!err) {
        setDbBusy(false)
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
    [BlockType.Embed]: embedSchema,
    [DocumentType.Group]: groupSchema,
    [DocumentType.Page]: pageSchema,
    [DocumentType.Selection]: selectionSchema,
    [DocumentType.BlockRelation]: blockRelationSchema,
    [DocumentType.UserPreferences]: userPreferenceSchema,
  }

  // add $ref schemas, these schemas are reused
  tv4.addSchema('text', textSchema)
  tv4.addSchema('point', pointSchema)
  tv4.addSchema('pouchDb', pouchDocSchema)
  tv4.addSchema('blockSchema', blockSchema)
  tv4.addSchema('notification', notificationSchema)

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
    console.log('[pouchDataValidation]', data)
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
