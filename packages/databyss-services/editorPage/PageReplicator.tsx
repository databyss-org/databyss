import React, { ReactNode, useEffect, useRef } from 'react'
import PouchDB from 'pouchdb'
import { useGroups } from '@databyss-org/data/pouchdb/hooks'
import {
  getPouchSecret,
  getDefaultGroup,
} from '@databyss-org/services/session/clientStorage'
import { LoadingFallback } from '@databyss-org/ui/components'
import { validateGroupCredentials } from './index'
import { ResourceNotFoundError, NotAuthorizedError } from '../interfaces/Errors'
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

  const startReplication = ({
    groupId,
    dbKey,
    dbPassword,
  }: {
    groupId: string
    dbKey: string
    dbPassword: string
  }) => {
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
    const _defaultGroupId = getDefaultGroup()
    const _replication = dbRef.current[_defaultGroupId!].replicate.to(
      `${REMOTE_CLOUDANT_URL}/${groupId}`,
      {
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
      }
    )
    replicationsRef.current.push(_replication)
  }

  // cancel the replications on unmount
  useEffect(() => {
    if (groupsRes.isSuccess) {
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
            const gId = group._id
            const dbCache = getPouchSecret()
            // id is in cache without the `p_` prefix
            const creds = dbCache[gId.substr(2)]
            if (!creds) {
              setTimeout(() => validate(), INTERVAL_TIME)
            } else {
              // credentials are in local
              // validate credentials with server
              validateGroupCredentials({
                groupId: group._id,
                dbKey: creds.dbKey,
              })
                .then(() => {
                  replicationStatusRef.current[group._id] = true
                  // start replication
                  startReplication({
                    groupId: gId,
                    dbKey: creds.dbKey,
                    dbPassword: creds.dbPassword,
                  })
                })
                .catch((err) => {
                  if (err instanceof ResourceNotFoundError) {
                    // database might not have been created yet
                    setTimeout(() => validate(), INTERVAL_TIME)
                  }
                  if (err instanceof NotAuthorizedError) {
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
      // TODO: if switching pages, this doesnt get called
      replicationsRef.current.forEach((replication) => {
        console.log('PageReplicator.cancelReplication', replication)
        replication.cancel()
      })
    }
  }, [groupsRes.isSuccess, JSON.stringify(groupsRes.data)])

  if (!groupsRes.isSuccess) {
    return <LoadingFallback queryObserver={groupsRes} />
  }

  return <>{children}</>
}
