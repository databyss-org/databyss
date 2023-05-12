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
import {
  checkNetwork,
  waitForNetwork,
} from '@databyss-org/services/lib/request'
import { isMobile } from '@databyss-org/ui/lib/mediaQuery'
import { QueryClient } from 'react-query'
import { DocumentType } from './interfaces'
import { setDbBusy } from './utils'
import { processGroupActionQ } from './groups/utils'
import { connect, CouchDb, couchDbRef } from '../couchdb/couchdb'
import embedSchema from '../schemas/embedSchema'
import { UnauthorizedDatabaseReplication } from '../../databyss-services/interfaces/Errors'
import { initialCaches, warmupCaches } from './warmup'
import { initChangeResponder } from '../couchdb/changeResponder'
import { initDriveDb } from '../drivedb/ddb'

export { selectors } from './selectors'
export const REMOTE_CLOUDANT_URL = `https://${process.env.CLOUDANT_HOST}`

// add plugins
PouchDB.plugin(PouchDBTransform)
PouchDB.plugin(PouchDbQuickSearch)
PouchDB.plugin(PouchDBFind)
PouchDB.plugin(PouchDBUpsert)

interface DbRef {
  current: PouchDB.Database<any> | null
  readOnly: boolean
  lastSeq: string | number
  initialSyncComplete: boolean
  lastReplicationSeq: string | number // seq of last upsertReplication
}

const getPouchDb = (groupId: string) => {
  const _db = new PouchDB(groupId, {
    auto_compaction: true,
  })
  return _db.setMaxListeners(100)
}

export const dbRef: DbRef = {
  current: null,
  readOnly: false,
  initialSyncComplete: false,
  lastSeq: 'now',
  lastReplicationSeq: 'now',
}

// try to load pouch_secrets from local storage to init db
const defaultGroup = getDefaultGroup()
const groupIdFromUrl = getAccountFromLocation()

// if you're logged-in but not on your own group's URL (you're on a public group url, eg),
//   skip initialization of pouchDb - it happens in initDb
if (
  defaultGroup &&
  (!groupIdFromUrl || groupIdFromUrl === defaultGroup || process.env.STORYBOOK)
) {
  dbRef.current = getPouchDb(defaultGroup)
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

export const resetPouchDb = async () => {
  if (dbRef.current) {
    await (dbRef.current as PouchDB.Database).destroy()
  }

  dbRef.current = null
}

export const BATCH_SIZE: number = (process.env.REPLICATE_BATCH_SIZE ??
  (100 as unknown)) as number
export const BATCHES_LIMIT: number = (process.env.REPLICATE_BATCHES_LIMIT ??
  (10 as unknown)) as number

/**
 * Replicates remote DB to local
 */
export const replicateDbFromRemote = ({
  groupId,
  pouchDb,
}: {
  groupId: string
  pouchDb: PouchDB.Database<any>
}) =>
  new Promise<boolean>((resolve, reject) => {
    console.log('[DB] replicateDbFromRemote', groupId)
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
      batch_size: BATCH_SIZE,
      batches_limit: BATCHES_LIMIT,
      style: 'main_only',
      checkpoint: false,
      auth: {
        username: _cred.dbKey,
        password: _cred.dbPassword,
      },
    }

    waitForNetwork().then((isOnline) => {
      if (isOnline) {
        pouchDb.replicate
          .from(_couchUrl, {
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

export const syncPouchDb = ({ groupId }: { groupId: string }) => {
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
    batch_size: BATCH_SIZE,
    batches_limit: BATCHES_LIMIT,
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

let _lastSeqMemo: string | number | undefined
let _lastSeqMemoRequestedAt: number | undefined
export const getLastSequence = () =>
  new Promise<string | number>((resolve, reject) => {
    if (dbRef.current instanceof CouchDb) {
      resolve('now')
      return
    }
    if (_lastSeqMemo && Date.now() - _lastSeqMemoRequestedAt! < 1000) {
      resolve(_lastSeqMemo)
      return
    }
    _lastSeqMemoRequestedAt = Date.now()
    dbRef.current
      ?.changes({
        return_docs: false,
        descending: true,
        limit: 1,
        since: 0,
      })
      .then((changes) => {
        _lastSeqMemo = changes.last_seq
        // console.log('[db] last_seq', changes.last_seq)
        resolve(changes.last_seq)
      })
      .catch(reject)
  })

export const initDb = ({
  groupId,
  isPublicGroup = false,
  onReplicationComplete,
  queryClient,
}: {
  groupId: string
  isPublicGroup: boolean
  onReplicationComplete?: (success: boolean) => void
  queryClient: QueryClient
}) =>
  new Promise<void>((resolve) => {
    const _pouchDb = getPouchDb(groupId)

    const _replicationComplete = async (success: boolean) => {
      if (!success) {
        console.warn('[DB] replication failed')
      } else {
        console.log('[DB] Replication done, switching to PouchDb')
        // dbRef.lastSeq = await getLastSequence()
        if (!Object.keys(initialCaches).length) {
          dbRef.lastSeq = await warmupCaches(_pouchDb, queryClient)
        }
        dbRef.current = _pouchDb
        dbRef.readOnly = isPublicGroup
        dbRef.initialSyncComplete = true

        await initDriveDb({ groupId })
      }
      if (onReplicationComplete) {
        onReplicationComplete(success)
      }
      resolve()
    }

    const _startInCouchMode = () => {
      console.log('[DB] Init using COUCH mode')
      if (!couchDbRef.current) {
        connect(groupId)
      }
      // HACK: a little trick to get the CouchDb ref to look like a PouchDb ref
      // because they are designed to have the same spec
      const _unknown = couchDbRef.current as unknown
      dbRef.current = _unknown as PouchDB.Database
      dbRef.readOnly = true

      // if no queryClient, just set couch mode and resolve (skip replication for now)
      if (!queryClient) {
        resolve()
        return
      }

      console.log(
        `[DB] Start replication ${groupId} (${
          isPublicGroup ? 'public' : 'private'
        })`
      )
      if (isPublicGroup || isMobile()) {
        // replicatePublicGroup({ groupId, pouchDb: _pouchDb }).then(
        //   _replicationComplete
        // )
        initChangeResponder({ queryClient, groupId })
        if (onReplicationComplete) {
          onReplicationComplete(true)
        }
        resolve()
      } else {
        replicateDbFromRemote({
          groupId,
          pouchDb: _pouchDb,
        }).then(_replicationComplete)
      }

      // if not in test env, resolve now so app can continue while replication happens
      // in the background
      if (process.env.NODE_ENV !== 'test') {
        resolve()
      }
    }

    // if we're offline, check pouch db ref for user_prefs doc
    // (it might already exist locally from prev session)
    checkNetwork().then((isOnline) =>
      !isOnline
        ? _pouchDb
            .get('user_preference')
            .then(() => {
              _replicationComplete(true)
            })
            .catch(() => {
              _startInCouchMode()
            })
        : // otherwise, always start in couch mode and run a replication
          // so we get the latest changes
          _startInCouchMode()
    )
  })

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
