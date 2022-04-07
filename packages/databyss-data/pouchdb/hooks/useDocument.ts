import { useEffect } from 'react'
import { useQuery, useQueryClient } from 'react-query'
import { Document } from '@databyss-org/services/interfaces'
import { useDatabaseContext } from '@databyss-org/services/lib/DatabaseProvder'
import { EM } from '@databyss-org/data/pouchdb/utils'

import { dbRef } from '../db'
import { CouchDb } from '../../couchdb-client/couchdb'

export interface UseDocumentOptions {
  enabled?: boolean
  initialData?: any
}

const subscriptionDict: { [_id: string]: boolean } = {}

export const useDocument = <T extends Document>(
  _id: string,
  options?: UseDocumentOptions
) => {
  const { isCouchMode } = useDatabaseContext()
  const queryClient = useQueryClient()
  const queryKey = `useDocument_${_id}`
  let _enabled = true
  if (options?.enabled !== undefined) {
    _enabled = options.enabled
  }

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
      enabled: _enabled,
      initialData: options?.initialData,
    }
  )

  useEffect(() => {
    if (!_enabled) {
      return
    }
    if (dbRef.current instanceof CouchDb) {
      return
    }
    if (subscriptionDict[_id]) {
      return
    }
    subscriptionDict[_id] = true
    dbRef!.current
      ?.changes({
        since: 'now',
        live: true,
        include_docs: true,
        doc_ids: [_id],
      })
      .on('change', (change) => {
        queryClient.setQueryData<T>(queryKey, change.doc)
      })!
  }, [options?.enabled, isCouchMode])

  return query
}
