import PouchDB from 'pouchdb'
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
  subscribe?: boolean
}

export const defaultUseDocumentOptions = {
  enabled: true,
  initialData: null,
  subscribe: true,
}

const subscriptionDict: {
  [_id: string]: PouchDB.Core.Changes<any> | undefined
} = {}

const subscriptionCount: { [selector: string]: number } = {}

export const useDocument = <T extends Document>(
  _id: string,
  options: UseDocumentOptions = {}
) => {
  const { isCouchMode } = useDatabaseContext()
  const queryClient = useQueryClient()
  const queryKey = `useDocument_${_id}`
  const _options = { ...defaultUseDocumentOptions, ...options }

  useEffect(() => {
    EM.process()
  }, [])

  const query = useQuery<T>(
    queryKey,
    () =>
      // console.log('[useDocument] fetch', _id)
      new Promise<T>((resolve, reject) => {
        console.log('[UseDocument] fetch')
        dbRef
          .current!.get(_id)
          .then((res) => resolve(res))
          .catch((err) => reject(err))
      }),
    {
      enabled: _options.enabled,
      initialData: options?.initialData,
    }
  )

  const subscribe = () => {
    if (!_options.enabled || !_options.subscribe) {
      return
    }
    if (dbRef.current instanceof CouchDb) {
      return
    }
    if (subscriptionDict[_id]) {
      subscriptionCount[_id] += 1
      return
    }
    // console.log('[useDocument] subscribe', _id)
    subscriptionCount[_id] = 1
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
  }

  const unsubscribe = () => {
    if (!subscriptionDict[_id]) {
      return
    }
    subscriptionCount[_id] -= 1
    if (subscriptionCount[_id] > 0) {
      return
    }
    console.log('[useDocument] unsubscribe', _id)
    subscriptionDict[_id]?.cancel()
    delete subscriptionDict[_id]

    // also remove from cache so it will be refetched
    queryClient.removeQueries(queryKey)
  }

  useEffect(() => {
    subscribe()
    return unsubscribe
  }, [options?.enabled, isCouchMode])

  return query
}
