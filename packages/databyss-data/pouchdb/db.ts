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
import { setDbBusy } from './utils'
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

let pouchDb: PouchDB.Database<any>

export const dbRef: DbRef = {
  current: null,
  readOnly: false,
}

// initDb with groupId from url or from localStorage (in case we are at '/')
let groupId: string | boolean | null = getAccountFromLocation()
if (!groupId) {
  groupId = getDefaultGroup()
}
if (groupId) {
  initDb(groupId as string)
} else {
  console.log('[DB] no groupId in URL or localStorage')
}

export const dbGroupId = () => groupId

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
export const replicatePublicGroup = ({
  groupId,
  hasAuthenticatedAccess,
}: {
  groupId: string
  hasAuthenticatedAccess: boolean
}) =>
  new Promise<boolean>((resolve, reject) => {
    const opts: any = {
      retry: true,
      batch_size: 1000,
    }
    if (hasAuthenticatedAccess) {
      const _auth = getReplicationAuth(groupId)
      if (!_auth) {
        reject()
        return
      }
      opts.auth = _auth
    }
    checkNetwork().then((isOnline) => {
      if (isOnline) {
        console.log('[DB] replicatePublicGroup')
        pouchDb.replicate
          ?.from(`${REMOTE_CLOUDANT_URL}/${groupId}`, {
            ...opts,
          })
          .on(
            'error',
            MakePouchReplicationErrorHandler(
              `[replicatePublicGroup:replicate ${groupId}]`
            )
          )
          .on('complete', () => {
            // switch to pouchdb
            console.log('[DB] Replication done, switching to PouchDb')
            dbRef.current = pouchDb
            dbRef.readOnly = !hasAuthenticatedAccess

            // start sync
            if (hasAuthenticatedAccess) {
              // read/write sync (authenticated)
              syncPouchDb(groupId)
              return
            }
            // read sync (unauthenticated)
            const _opts = {
              ...opts,
              live: true,
              continuous: true,
            }
            // when replication is complete, kick off a live sync
            pouchDb.replicate
              .from(`${REMOTE_CLOUDANT_URL}/${groupId}`, {
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
      } else {
        // ofline
        console.log('[DB] Offline, skipping replication')
        dbRef.current = pouchDb
        dbRef.readOnly = !hasAuthenticatedAccess
        resolve(false)
      }
    })
  })

export function getReplicationAuth(groupId: string) {
  const _creds = getPouchSecret()

  if (!_creds) {
    console.log('[DB] getReplicationAuth: no pouch secrets')
    return false
  }

  const _cred = _creds[groupId]

  if (!_cred) {
    console.log('[DB] getReplicationAuth: group not in secrets')
    return false
  }

  return {
    username: _cred.dbKey,
    password: _cred.dbPassword,
  }
}

/*
replicates remote DB to local
*/
export const replicateDbFromRemote = (groupId: string) =>
  new Promise<boolean>((resolve, reject) => {
    console.log('[DB] replicateDbFromRemote', groupId)
    const _couchUrl = `${REMOTE_CLOUDANT_URL}/${groupId}`
    const _auth = getReplicationAuth(groupId)

    if (!_auth) {
      reject()
      return
    }

    const opts = {
      // live: true,
      retry: true,
      // continuous: true,
      batch_size: 1000,
      auth: _auth,
    }

    checkNetwork().then((isOnline) => {
      if (isOnline) {
        pouchDb.replicate
          .from(_couchUrl, {
            ...opts,
          })
          .on(
            'error',
            MakePouchReplicationErrorHandler('[replicateDbFromRemote]')
          )
          .on('complete', () => {
            // switch to pouchdb
            console.log('[DB] Replication done, switching to PouchDb')
            dbRef.current = pouchDb
            dbRef.readOnly = false
            // kick off live sync
            syncPouchDb(groupId)
            resolve(true)
          })
      } else {
        console.log('[DB] Offline, skipping replication')
        dbRef.current = pouchDb
        dbRef.readOnly = false
        resolve(false)
      }
    })
  })

export function syncPouchDb(groupId: string) {
  if (dbRef.current instanceof CouchDb) {
    return
  }
  console.log('[DB] Start PouchDb sync')
  // pass  the  session provider dispatch to the patch queue

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

export async function initDb(groupId: string) {
  pouchDb = new PouchDB(groupId, {
    auto_compaction: true,
  })
  // couch connect
  connect(groupId)
  // HACK: a little trick to get the CouchDb ref to look like a PouchDb ref
  // because they are designed to have the same spec
  const _unknown = couchDbRef.current as unknown
  dbRef.current = _unknown as PouchDB.Database
  dbRef.readOnly = true
  if (!(await checkNetwork())) {
    try {
      // user session
      await pouchDb.get('user_preference')
      dbRef.current = pouchDb
    } catch {
      console.log('[DB] OFFLINE no user_preference, trying group')
      try {
        // group session
        if (
          (
            await pouchDb.find({
              selector: {
                doctype: 'GROUP',
              },
            })
          )?.docs?.[0]
        ) {
          dbRef.current = pouchDb
        }
      } catch {
        console.log('[DB] OFFLINE no group')
      }
    }
  }
}

export const waitForPouchDb = (timeout: number = 1200000) =>
  new Promise<boolean>((resolve) => {
    const _startTime = Date.now()
    const _checkDb = () => {
      if (Date.now() - _startTime > timeout) {
        console.warn('[DB] waitForPouchDb timed out')
        resolve(false)
        return
      }
      if (dbRef.current && !(dbRef.current instanceof CouchDb)) {
        resolve(true)
        return
      }
      setTimeout(_checkDb, 500)
    }
    _checkDb()
  })
