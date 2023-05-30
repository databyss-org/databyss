import React, { ReactNode, useEffect, useRef } from 'react'
import PouchDB from 'pouchdb'
import { useGroups } from '@databyss-org/data/pouchdb/hooks'
import { getPouchSecret } from '@databyss-org/services/session/clientStorage'
import { CouchDb } from '@databyss-org/data/couchdb/couchdb'
import { LoadingFallback } from '@databyss-org/ui/components'
import { useSessionContext } from '@databyss-org/services/session/SessionProvider'
import { useNotifyContext } from '@databyss-org/ui/components/Notify/NotifyProvider'
import { replicatePublicEmbeds } from '@databyss-org/data/pouchdb/groups'
import { validateGroupCredentials, createDatabaseCredentials } from './index'
import {
  ResourceNotFoundError,
  NotAuthorizedError,
  NetworkUnavailableError,
} from '../interfaces/Errors'
import {
  BATCHES_LIMIT,
  BATCH_SIZE,
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
}: {
  children: ReactNode
  pageId: string
}) => {
  const replicationsRef = useRef<PouchDB.Replication.Replication<any>[]>([])

  const replicationStatusRef = useRef<{ [key: string]: boolean }>({})

  // get the groups from react-query
  const groupsRes = useGroups()

  const { isOnline } = useNotifyContext()
  const isPublicAccount = useSessionContext((c) => c && c.isPublicAccount)
  const isReadOnly = useSessionContext((c) => c && c.isReadOnly)

  const startReplication = ({
    groupId,
    dbKey,
    dbPassword,
  }: {
    groupId: string
    dbKey: string
    dbPassword: string
  }) => {
    setDbBusy(true)
    if (dbRef.current instanceof CouchDb) {
      return
    }

    // set up page replication
    const opts: any = {
      live: true,
      batch_size: BATCH_SIZE,
      batches_limit: BATCHES_LIMIT,
      retry: true,
      continuous: true,
      auth: {
        username: dbKey,
        password: dbPassword,
      },
    }
    opts.since =
      dbRef.lastReplicationSeq === 'now'
        ? dbRef.lastSeq
        : dbRef.lastReplicationSeq
    const _replication = dbRef
      .current!.replicate.to(`${REMOTE_CLOUDANT_URL}/${groupId}`, {
        ...opts,
        // do not replciate design docs or documents that are not shared with group
        filter: (doc) => {
          if (!doc?.sharedWithGroups) {
            return false
          }
          const _isSharedWithGroup = doc?.sharedWithGroups.includes(groupId)
          if (!_isSharedWithGroup) {
            return false
          }
          return !doc._id.includes('design/')
        },
      })
      .on('error', MakePouchReplicationErrorHandler('[startReplication]', true))
      .on('change', async (_info) => {
        const _embedDocs =
          _info?.docs?.filter((doc: any) => doc.type === 'EMBED') ?? []
        console.log('[PageReplicator] embed docs changed', _embedDocs)
        await replicatePublicEmbeds({ docs: _embedDocs, groupId })
        setDbBusy(true)
      })
      .on('paused', (err) => {
        if (!err) {
          setDbBusy(false)
        }
      })

    replicationsRef.current.push(_replication)
  }

  // cancel the replications on unmount
  useEffect(() => {
    if (
      isOnline &&
      !isReadOnly &&
      !isPublicAccount() &&
      groupsRes.isSuccess &&
      pageId
    ) {
      // find all public groups that contain this page
      const groupsWithPage = Object.values(groupsRes.data!).filter(
        (group) => group.public && group.pages.includes(pageId)
      )
      groupsWithPage.forEach((group) => {
        console.log(
          `[PageReplicator] starting public replication for ${group._id}`
        )
        // check if group is already replicating
        const _repStatus = replicationStatusRef.current[group._id]
        if (!_repStatus) {
          const validate = (count: number = 0) => {
            if (count > MAX_RETRIES) {
              console.log(
                `[PageReplicator] retry limit exceeded when trying to replicate to group ${group._id}`
              )
              return
            }
            // check local storage for credentials
            // get group credentials from local storage

            const dbCache = getPouchSecret()
            // id is in cache without the `p_` prefix
            const creds = dbCache[group._id]
            if (!creds) {
              // credentials are not in local storage
              // creates new user credentials and adds them to local storage
              console.log('[PageReplicator] createDatabaseCredentials')
              createDatabaseCredentials({
                groupId: group._id,
                isPublic: group.public,
              })
                .then(() => {
                  setTimeout(() => validate(count + 1), INTERVAL_TIME)
                })
                .catch((err) => {
                  if (err instanceof NetworkUnavailableError) {
                    // if user is offline, just bail
                    console.log(
                      '[PageReplicator] skipping public page replication in offline mode'
                    )
                    return
                  }
                  setTimeout(() => validate(count + 1), INTERVAL_TIME)
                })
            } else {
              // credentials are in local
              // validate credentials with server
              validateGroupCredentials({
                groupId: group._id,
                dbKey: creds.dbKey,
              })
                .then(() => {
                  replicationStatusRef.current[group._id] = true
                  // start replication with creds
                  startReplication({
                    groupId: group._id,
                    dbKey: creds.dbKey,
                    dbPassword: creds.dbPassword,
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
                    setTimeout(() => validate(count + 1), INTERVAL_TIME)
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
          validate()
        }
      })
    }

    return () => {
      replicationStatusRef.current = {}
      replicationsRef.current.forEach((replication) => {
        replication.cancel()
      })
    }
  }, [
    groupsRes.isSuccess,
    JSON.stringify(groupsRes.data),
    isOnline,
    isReadOnly,
  ])

  if (!groupsRes.isSuccess) {
    return <LoadingFallback queryObserver={groupsRes} />
  }

  return <>{children}</>
}
