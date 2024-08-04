import PouchDB from 'pouchdb'
import PouchDBFind from 'pouchdb-find'
import PouchDBUpsert from 'pouchdb-upsert'
import PouchDbQuickSearch from 'pouchdb-quick-search'
import PouchDBTransform from 'transform-pouch'
import {
  getPouchSecret,
  getDbCredentialsFromLocal,
  getDefaultGroup,
} from '@databyss-org/services/session/clientStorage'
import {
  getAccountFromLocation,
  getRemoteDbData,
  getRemoteDbInfo,
  getRemoteSearchData,
  remoteDbHasUpdate,
} from '@databyss-org/services/session/utils'
import { waitForNetwork } from '@databyss-org/services/lib/request'
import { isMobile } from '@databyss-org/ui/lib/mediaQuery'
import { QueryClient } from '@tanstack/react-query'
import { sleep } from '@databyss-org/services/lib/util'
import { setDbBusy } from './utils'
import { processGroupActionQ } from './groups/utils'
import { connect, CouchDb, couchDbRef } from '../couchdb/couchdb'

import { UnauthorizedDatabaseReplication } from '../../databyss-services/interfaces/Errors'
import { initialCaches, warmupCaches } from './warmup'
import { initChangeResponder } from '../couchdb/changeResponder'
import { initDriveDb } from '../drivedb/ddb'
import { dbRef } from './dbRef'

export { dbRef } from './dbRef'

export { selectors } from './selectors'
export const REMOTE_CLOUDANT_URL = `https://${process.env.CLOUDANT_HOST}`

// add plugins
PouchDB.plugin(PouchDBTransform)
PouchDB.plugin(PouchDbQuickSearch)
PouchDB.plugin(PouchDBFind)
PouchDB.plugin(PouchDBUpsert)

const getPouchDb = (groupId: string) => {
  const _db = new PouchDB(groupId, {
    auto_compaction: true,
  })
  return _db.setMaxListeners(100)
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
  dbRef.groupId = defaultGroup
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
        dbRef.groupId = groupId
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
    waitForNetwork({ pollTimer: 500, maxAttempts: 4 }).then((isOnline) =>
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

export const initDbFromJson = async (groupId: string) => {
  // init dbRef
  dbRef.groupId = groupId
  dbRef.readOnly = true

  // import data db
  let _dataDb = getPouchDb(groupId)
  dbRef.current = _dataDb

  // check for remote updates (will return true if db hasn't been downloaded yet)
  const _remoteDbInfo = await getRemoteDbInfo(groupId)
  dbRef.searchMd5 = _remoteDbInfo.searchMd5
  if (!(await remoteDbHasUpdate(_remoteDbInfo))) {
    dbRef.initialSyncComplete = true
    return
  }

  // delete and re-make group db because we have updates
  await _dataDb.destroy()
  _dataDb = getPouchDb(groupId)
  dbRef.current = _dataDb

  // get remote data
  const _remoteDbData = await getRemoteDbData(groupId)
  await _dataDb.bulkDocs(_remoteDbData.dbRows, { new_edits: false })
  dbRef.searchMd5 = _remoteDbData.info.searchMd5
  dbRef.initialSyncComplete = true
}

export const initSearchDbFromJson = async (
  groupId: string,
  searchMd5: string
) => {
  // import search db
  const _searchDbRows = await getRemoteSearchData(groupId)
  if (!_searchDbRows) {
    console.log('[initDbFromJson] no remote search data found')
    return
  }
  dbRef.searchIndexProgress = 0
  const _startTime = Date.now()
  const _searchDb = new PouchDB(`${groupId}-search-${searchMd5}`)
  let _docsRemaining = _searchDbRows.length
  let _currPage = 0
  const _pageSize = 5000
  while (_docsRemaining > 0) {
    const _startDocIdx = _currPage * _pageSize
    const _endDocIdx = _startDocIdx + Math.min(_pageSize, _docsRemaining)
    const _rowsToImport = _searchDbRows.slice(_startDocIdx, _endDocIdx)
    await _searchDb.bulkDocs(_rowsToImport, { new_edits: false })
    dbRef.searchIndexProgress = 1 - _docsRemaining / _searchDbRows.length

    // yield processor
    await sleep(50)
    _currPage += 1
    _docsRemaining -= _pageSize
  }
  dbRef.searchIndexProgress = 1
  const _endTime = Date.now()
  const _elapsed = _endTime - _startTime
  console.log(
    `[DB] imported ${_searchDbRows.length} search index records in ${
      _elapsed / 1000
    }s`
  )
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
