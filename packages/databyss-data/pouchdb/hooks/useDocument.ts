import { useEffect } from 'react'
import { useQuery, useQueryClient } from 'react-query'
import { Document } from '@databyss-org/services/interfaces'
import PouchDB from 'pouchdb'
import { EM } from '@databyss-org/data/pouchdb/utils'

import { dbRef } from '../db'
import { CouchDb } from '../../couchdb-client/couchdb'

export interface UseDocumentOptions {
  enabled?: boolean
  initialData?: any
}

const subscriptionDict: { [_id: string]: PouchDB.Core.Changes<any> } = {}

export const useDocument = <T extends Document>(
  _id: string,
  options: UseDocumentOptions = { enabled: true }
) => {
  const queryClient = useQueryClient()
  const queryKey = `useDocument_${_id}`

  useEffect(() => {
    EM.process()
  }, [])

  const query = useQuery<T>(
    queryKey,
    () =>
      new Promise<T>((resolve, reject) => {
        dbRef
          .current!.get(_id)
          .then((res) => resolve(res))
          .catch((err) => reject(err))
      }),
    {
      enabled: options.enabled,
      initialData: options.initialData,
    }
  )

  useEffect(() => {
    if (dbRef.current instanceof CouchDb) {
      return
    }
    if (subscriptionDict[_id]) {
      return
    }
    subscriptionDict[_id] = dbRef!.current
      ?.changes({
        since: 'now',
        live: true,
        include_docs: true,
        doc_ids: [_id],
      })
      .on('change', (change) => {
        queryClient.setQueryData<T>(queryKey, change.doc)
      })!
  }, [])

  return query
}