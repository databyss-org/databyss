import React, { ReactNode, useEffect, useRef } from 'react'
import PouchDB from 'pouchdb'
import { dbRef, REMOTE_CLOUDANT_URL } from '@databyss-org/data/pouchdb/db'
import { useGroups } from '@databyss-org/data/pouchdb/hooks'
import { getDefaultGroup } from '@databyss-org/services/session/clientStorage'
import { LoadingFallback } from '@databyss-org/ui/components'

export const PageReplicator = ({
  children,
  pageId,
}: {
  children: ReactNode
  pageId: string
}) => {
  const replicationsRef = useRef<PouchDB.Replication.Replication<any>[]>([])

  // cancel the replications on unmount
  useEffect(
    () => () =>
      replicationsRef.current.forEach((replication) => {
        console.log('PageReplicator.cancelReplication', replication)
        replication.cancel()
      }),
    []
  )

  // get the groups from react-query
  const groupsRes = useGroups()
  if (!groupsRes.isSuccess) {
    return <LoadingFallback queryObserver={groupsRes} />
  }

  // find all groups that contain this page
  const groupsWithPage = Object.values(groupsRes.data!).filter((group) =>
    group.pages.includes(pageId)
  )

  console.log('PageReplicator.groupsWithPage', groupsWithPage)

  groupsWithPage.forEach((group) => {
    // set up page replication
    console.log('PageReplicator.replicate', group._id)
    const _defaultGroupId = getDefaultGroup()
    const _replication = dbRef.current[_defaultGroupId!].replicate.to(
      `${REMOTE_CLOUDANT_URL}/${group._id}`,
      {
        live: true,
        retry: false,
        // do not replciate design docs or documents that dont include the page
        filter: (doc) => {
          if (!doc?.sharedWithGroups) {
            return false
          }
          const _isSharedWithGroup = doc?.sharedWithGroups.includes(group._id)
          if (!_isSharedWithGroup) {
            return false
          }
          return !doc._id.includes('design/')
        },
      }
    )
    replicationsRef.current.push(_replication)
  })

  return <>{children}</>
}
