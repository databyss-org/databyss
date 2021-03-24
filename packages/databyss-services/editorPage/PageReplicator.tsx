import React, { ReactNode, useEffect, useRef } from 'react'
import PouchDB from 'pouchdb'
import { useGroups } from '@databyss-org/data/pouchdb/hooks'
import { getPouchSecret } from '@databyss-org/services/session/clientStorage'
import { LoadingFallback } from '@databyss-org/ui/components'
import { useSessionContext } from '@databyss-org/services/session/SessionProvider'
import { validateGroupCredentials, createDatabaseCredentials } from './index'
import {
  ResourceNotFoundError,
  NotAuthorizedError,
  NetworkUnavailableError,
} from '../interfaces/Errors'
import { dbRef, REMOTE_CLOUDANT_URL } from '../../databyss-data/pouchdb/db'

const INTERVAL_TIME = 3000

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

  const sessionDispatch = useSessionContext((c) => c && c.dispatch)

  const startReplication = ({
    groupId,
    dbKey,
    dbPassword,
  }: {
    groupId: string
    dbKey: string
    dbPassword: string
  }) => {
    sessionDispatch({
      type: 'DB_BUSY',
      payload: {
        isBusy: true,
      },
    })

    // set up page replication
    const opts = {
      live: true,
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
        // do not replciate design docs or documents that dont include the page
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
      // keeps track of the loader wheel
      .on('change', () => {
        sessionDispatch({
          type: 'DB_BUSY',
          payload: {
            isBusy: true,
          },
        })
      })
      .on('paused', (err) => {
        if (!err) {
          sessionDispatch({
            type: 'DB_BUSY',
            payload: {
              isBusy: false,
            },
          })
        }
      })

    replicationsRef.current.push(_replication)
  }

  // cancel the replications on unmount
  useEffect(() => {
    if (groupsRes.isSuccess && pageId) {
      // find all groups that contain this page
      const groupsWithPage = Object.values(groupsRes.data!).filter((group) =>
        group.pages.includes(pageId)
      )
      groupsWithPage.forEach((group) => {
        // check if group is already replicating
        const _repStatus = replicationStatusRef.current[group._id]
        if (!_repStatus) {
          const validate = async () => {
            // check local storage for credentials
            // get group credentials from local storage

            // if group ID does not begin with p_ assume its a shared group with g_
            const gId =
              group._id.substr(0, 2) === 'p_' ? group._id : `g_${group._id}`

            const dbCache = getPouchSecret()
            // id is in cache without the `p_` prefix
            const creds = dbCache[gId.substr(2)]
            if (!creds) {
              // credentials are not in local storage
              // creates new user credentials and adds them to local storage
              await createDatabaseCredentials({
                groupId: gId,
                isPublic: group.public,
              }).catch((err) => {
                if (err instanceof NetworkUnavailableError) {
                  // user might be offline
                  setTimeout(() => validate(), INTERVAL_TIME)
                }
              })
              setTimeout(() => validate(), INTERVAL_TIME)
            } else {
              // credentials are in local
              // validate credentials with server
              validateGroupCredentials({
                groupId: gId,
                dbKey: creds.dbKey,
              })
                .then(() => {
                  replicationStatusRef.current[group._id] = true
                  // start replication with creds
                  startReplication({
                    groupId: gId,
                    dbKey: creds.dbKey,
                    dbPassword: creds.dbPassword,
                  })
                })
                .catch((err) => {
                  if (
                    err instanceof ResourceNotFoundError ||
                    err instanceof NetworkUnavailableError
                  ) {
                    // database might not have been created or user might be offline
                    setTimeout(() => validate(), INTERVAL_TIME)
                  }
                  if (err instanceof NotAuthorizedError) {
                    // user does not have permission, do not retry
                    console.error('NOT AUTHORIZED')
                  }
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
  }, [groupsRes.isSuccess, JSON.stringify(groupsRes.data)])

  if (!groupsRes.isSuccess) {
    return <LoadingFallback queryObserver={groupsRes} />
  }

  return <>{children}</>
}
