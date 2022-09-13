import { useEffect, useRef } from 'react'
import { useQuery, useQueryClient, UseQueryOptions } from 'react-query'
import { useDatabaseContext } from '@databyss-org/services/lib/DatabaseProvder'
import { DocumentDict, Document } from '@databyss-org/services/interfaces'
import PouchDB from 'pouchdb'

import { dbRef } from '../db'
import { CouchDb } from '../../couchdb-client/couchdb'
import { DocumentArrayToDict } from './utils'
import { defaultUseDocumentOptions, UseDocumentOptions } from './useDocument'
import { uid } from '../../lib/uid'

const subscriptionDict: {
  [selector: string]: PouchDB.Core.Changes<any> | undefined
} = {}
const sequenceDict: { [selector: string]: string | number } = {}
const subscriptionListeners: { [selector: string]: Set<string> } = {}

export const useDocuments = <T extends Document>(
  selectorOrIdList: PouchDB.Find.Selector | string[],
  options: UseDocumentOptions = {}
) => {
  const listenerIdRef = useRef<string>(uid())
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
      subscriptionListeners[queryKey].add(listenerIdRef.current)
      // console.log(
      //   '[useDocuments] subscribe',
      //   queryKey,
      //   subscriptionListeners[queryKey].size
      // )
      return
    }
    // sequenceDict[queryKey] = 'now'
    subscriptionListeners[queryKey] = new Set([listenerIdRef.current])
    subscriptionDict[queryKey] = dbRef.current
      ?.changes({
        since: sequenceDict[queryKey] ?? 'now',
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
          sequenceDict[queryKey] = change.seq
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
    subscriptionListeners[queryKey].delete(listenerIdRef.current)
    if (subscriptionListeners[queryKey].size) {
      return
    }
    // console.log('[useDocuments] unsubscribe', queryKey)
    subscriptionDict[queryKey]?.cancel()
    delete subscriptionDict[queryKey]
  }

  useEffect(() => {
    if (!(dbRef.current instanceof CouchDb) && !sequenceDict[queryKey]) {
      dbRef.current
        ?.changes({
          return_docs: false,
          since: 0,
        })
        .then((changes) => {
          sequenceDict[queryKey] = changes.last_seq
        })
    }
    subscribe()
    return unsubscribe
  }, [options?.enabled, isCouchMode])

  return query
}
