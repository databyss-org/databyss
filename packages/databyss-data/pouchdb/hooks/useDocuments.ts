import { useEffect } from 'react'
import { useQuery, useQueryClient, UseQueryOptions } from 'react-query'
import { useDatabaseContext } from '@databyss-org/services/lib/DatabaseProvder'
import { DocumentDict, Document } from '@databyss-org/services/interfaces'
import PouchDB from 'pouchdb'

import { dbRef } from '../db'
import { CouchDb } from '../../couchdb-client/couchdb'
import { DocumentArrayToDict } from './utils'
import { defaultUseDocumentOptions, UseDocumentOptions } from './useDocument'

const subscriptionDict: {
  [selector: string]: PouchDB.Core.Changes<any> | undefined
} = {}

const subscriptionCount: { [selector: string]: number } = {}

export const useDocuments = <T extends Document>(
  selectorOrIdList: PouchDB.Find.Selector | string[],
  options: UseDocumentOptions = {}
) => {
  const queryClient = useQueryClient()
  const { isCouchMode } = useDatabaseContext()
  const _options = { ...defaultUseDocumentOptions, ...options }

  let docIds: string[]
  let selector: PouchDB.Find.Selector | undefined
  if (Array.isArray(selectorOrIdList)) {
    docIds = selectorOrIdList
  } else {
    selector = selectorOrIdList
  }

  const queryKey = selector
    ? JSON.stringify(selector)
    : JSON.stringify(`documents_${docIds!}`)

  // console.log('useDocuments.selector', selector)
  const query = useQuery<DocumentDict<T>>(
    queryKey,
    () =>
      new Promise<DocumentDict<T>>((resolve, reject) => {
        // console.log('useDocuments.fetch', selector)
        if (docIds) {
          dbRef.current
            ?.allDocs({
              include_docs: true,
              keys: docIds,
            })
            .then((res) =>
              resolve(
                DocumentArrayToDict(
                  res.rows.map((r) => r.doc).filter((r) => !!r)
                )
              )
            )
            .catch((err) => {
              console.error('[useDocuments] error', err)
              reject(err)
            })
        } else {
          dbRef.current
            ?.find({ selector: selector! })
            .then((res) => resolve(DocumentArrayToDict(res.docs)))
            .catch((err) => reject(err))
        }
      }),
    options as UseQueryOptions<DocumentDict<T>>
  )

  const subscribe = () => {
    if (!_options.enabled || !_options.subscribe) {
      return
    }
    if (dbRef.current instanceof CouchDb) {
      return
    }
    if (subscriptionDict[queryKey]) {
      subscriptionCount[queryKey] += 1
      return
    }
    // console.log('[useDocuments] subscribe', queryKey)
    subscriptionCount[queryKey] = 1
    subscriptionDict[queryKey] = dbRef.current
      ?.changes({
        since: 'now',
        live: true,
        include_docs: true,
        ...(docIds
          ? {
              doc_ids: docIds,
            }
          : {
              selector: selector!,
            }),
      })
      .on('change', (change) => {
        queryClient.setQueryData<DocumentDict<T>>(queryKey, (oldData) => {
          if (!oldData) {
            return {}
          }
          if (change.deleted) {
            // remove from cache
            delete oldData![change.doc._id]
          } else {
            // add or update cache
            oldData![change.doc._id] = change.doc
          }
          return oldData as DocumentDict<T>
        })
      })!
  }

  const unsubscribe = () => {
    if (!subscriptionDict[queryKey]) {
      return
    }
    subscriptionCount[queryKey] -= 1
    if (subscriptionCount[queryKey] > 0) {
      return
    }
    // console.log('[useDocuments] unsubscribe', queryKey)
    subscriptionDict[queryKey]?.cancel()
    delete subscriptionDict[queryKey]
  }

  useEffect(() => {
    subscribe()
    return unsubscribe
  }, [options?.enabled, isCouchMode])

  return query
}
