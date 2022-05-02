import React, { ReactNode, useEffect, useRef } from 'react'
import PouchDB from 'pouchdb'
import { getPouchSecret } from '@databyss-org/services/session/clientStorage'
import { CouchDb } from '@databyss-org/data/couchdb-client/couchdb'
import { useSessionContext } from '@databyss-org/services/session/SessionProvider'
import { useNotifyContext } from '@databyss-org/ui/components/Notify/NotifyProvider'
import { validateGroupCredentials, createDatabaseCredentials } from './index'
import {
  ResourceNotFoundError,
  NotAuthorizedError,
  NetworkUnavailableError,
} from '../interfaces/Errors'
import {
  dbRef,
  MakePouchReplicationErrorHandler,
  REMOTE_CLOUDANT_URL,
} from '../../databyss-data/pouchdb/db'
import { setDbBusy } from '../../databyss-data/pouchdb/utils'

const INTERVAL_TIME = 5000
const MAX_RETRIES = 10

export const PageReplicator = ({
  children,
  pageId,
  sharedWithGroups,
}: {
  children: ReactNode
  pageId: string
  sharedWithGroups: string[]
}) => {
  const replicationsRef = useRef<PouchDB.Replication.Replication<any>[]>([])
  const replicationStatusRef = useRef<{ [key: string]: boolean }>({})

  const { isOnline } = useNotifyContext()
  const isReadOnly = useSessionContext((c) => c && c.isReadOnly)
  const getPublicAccount = useSessionContext((c) => c && c.getPublicAccount)

  const startReplication = ({
    groupId,
    dbKey,
    dbPassword,
    isPublic,
  }: {
    groupId: string
    dbKey: string
    dbPassword: string
    isPublic: boolean
  }) => {
    setDbBusy(true)
    if (dbRef.current instanceof CouchDb) {
      return
    }
    console.log('[PageReplicator] startReplication', groupId)

    // set up page replication
    const opts = {
      live: true,
      batch_size: 1000,
      retry: true,
      continuous: true,
      auth: {
        username: dbKey,
        password: dbPassword,
      },
    }

    const _replication = dbRef
      .current!.replicate.to(`${REMOTE_CLOUDANT_URL}/${groupId}`, {
        ...opts,
        filter: (doc) => {
          // if filtering from parent -> managed group, only include
          // docs where sharedWithGroups contains the groupId
          if (isPublic && !doc?.sharedWithGroups?.includes(groupId)) {
            return false
          }
          // do not replciate design docs
          return !doc._id.includes('design/')
        },
      })
      .on('error', MakePouchReplicationErrorHandler('[startReplication]', true))
      // keeps track of the loader wheel
      .on('change', () => {
        setDbBusy(true)
      })
      .on('paused', (err) => {
        if (!err) {
          setDbBusy(false)
        }
      })

    replicationsRef.current.push(_replication)
  }

  const validateAndStart = (
    { groupId, isPublic }: { groupId: string; isPublic: boolean },
    count: number = 0
  ) => {
    if (count > MAX_RETRIES) {
      console.log(
        `[PageReplicator] retry limit exceeded when trying to replicate to group ${groupId}`
      )
      return
    }
    // check local storage for credentials
    // get group credentials from local storage

    const dbCache = getPouchSecret()
    // id is in cache without the `p_` prefix
    const creds = dbCache[groupId]
    if (!creds) {
      // credentials are not in local storage
      // creates new user credentials and adds them to local storage
      console.log('[PageReplicator] createDatabaseCredentials')
      createDatabaseCredentials({ groupId, isPublic })
        .then(() => {
          setTimeout(
            () => validateAndStart({ groupId, isPublic }, count + 1),
            INTERVAL_TIME
          )
        })
        .catch((err) => {
          if (err instanceof NetworkUnavailableError) {
            // if user is offline, just bail
            console.log(
              '[PageReplicator] skipping public page replication in offline mode'
            )
            return
          }
          setTimeout(
            () => validateAndStart({ groupId, isPublic }, count + 1),
            INTERVAL_TIME
          )
        })
    } else {
      // credentials are in local
      // validate credentials with server
      console.log('[PageReplicator] validateDatabaseCredentials')
      validateGroupCredentials({ groupId, dbKey: creds.dbKey })
        .then(() => {
          replicationStatusRef.current[groupId] = true
          // start replication with creds
          startReplication({
            groupId,
            dbKey: creds.dbKey,
            dbPassword: creds.dbPassword,
            isPublic,
          })
        })
        .catch((err) => {
          if (err instanceof NetworkUnavailableError) {
            console.log(
              '[PageReplicator] skipping public page replication in offline mode'
            )
            return
          }
          if (err instanceof ResourceNotFoundError) {
            // database might not have been created, wait a bit longer
            setTimeout(
              () => validateAndStart({ groupId, isPublic }, count + 1),
              INTERVAL_TIME
            )
            return
          }
          if (err instanceof NotAuthorizedError) {
            // user does not have permission, do not retry
            console.error('[PageReplicator] NOT AUTHORIZED')
            return
          }
          throw err
        })
    }
  }

  const cancelReplications = () => {
    replicationStatusRef.current = {}
    replicationsRef.current.forEach((replication) => {
      replication.cancel()
    })
  }

  useEffect(() => {
    if (
      !isOnline ||
      dbRef.current instanceof CouchDb ||
      isReadOnly ||
      !sharedWithGroups.length ||
      !pageId
    ) {
      return () => null
    }
    // if we are on an authenticated group session, replicate to user collection
    if (getPublicAccount()?.hasAuthenticatedAccess) {
      const _replicateToGroupId = getPublicAccount().belongsToGroup
      console.log(
        '[PageReplicator] starting replication back to parent group',
        _replicateToGroupId
      )
      // check if group is already replicating
      if (!replicationStatusRef.current[_replicateToGroupId]) {
        validateAndStart({ groupId: _replicateToGroupId, isPublic: false })
      }
    }
    // find all public groups that contain this page
    sharedWithGroups.forEach((groupId) => {
      console.log(`[PageReplicator] starting public replication for ${groupId}`)
      // check if group is already replicating
      if (!replicationStatusRef.current[groupId]) {
        validateAndStart({ groupId, isPublic: true })
      }
    })

    // cancel the replications on unmount
    return cancelReplications
  }, [sharedWithGroups, isOnline, isReadOnly, dbRef.current])

  return <>{children}</>
}
