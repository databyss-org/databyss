import { useEffect, useRef } from 'react'
import {
  QueryKey,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from 'react-query'
import { useDatabaseContext } from '@databyss-org/services/lib/DatabaseProvder'
import { DocumentDict, Document } from '@databyss-org/services/interfaces'
import PouchDB from 'pouchdb'

import { dbRef, getLastSequence } from '../db'
import { CouchDb } from '../../couchdb/couchdb'
import { DocumentArrayToDict } from './utils'
import {
  applyDefaultUseDocumentOptions,
  UseDocumentOptions,
} from './useDocument'
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
  const _options = applyDefaultUseDocumentOptions(options)

  let docIds: string[]
  let queryKey: QueryKey
  let selector: PouchDB.Find.Selector | undefined
  if (Array.isArray(selectorOrIdList)) {
    queryKey = selectorOrIdList
    docIds = selectorOrIdList
  } else {
    queryKey = [selectorOrIdList]
    selector = selectorOrIdList
  }
  const queryKeyJson = JSON.stringify(queryKey)

  // console.log('useDocuments.selector', selector)
  const query = useQuery<DocumentDict<T>>(
    queryKey,
    () =>
      new Promise<DocumentDict<T>>((resolve, reject) => {
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
          if (!selector) {
            console.log('[useDocuments] no selector')
            return
          }
          // console.log('[useDocuments] fetch', selector)
          dbRef.current
            ?.find({ selector })
            .then((res) => {
              // console.log('[useDocuments] resolve', res)
              resolve(DocumentArrayToDict(res.docs))
            })
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
    // console.log('[useDocuments] subscribe', queryKeyJson)
    if (subscriptionDict[queryKeyJson]) {
      subscriptionListeners[queryKeyJson].add(listenerIdRef.current)
      // console.log('[useDocuments] subscribe', dbRef.lastSeq)
      return
    }
    // sequenceDict[queryKeyJson] = 'now'
    subscriptionListeners[queryKeyJson] = new Set([listenerIdRef.current])
    subscriptionDict[queryKeyJson] = dbRef.current
      ?.changes({
        since: sequenceDict[queryKeyJson] ?? dbRef.lastSeq,
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
          // console.log('[useDocuments] change', queryKey, change)
          if (!oldData) {
            return { [change.doc._id]: change.doc }
          }
          sequenceDict[queryKeyJson] = change.seq
          if (change.deleted) {
            // remove from cache
            delete oldData[change.doc._id]
          } else {
            // add or update cache
            oldData[change.doc._id] = change.doc
          }
          return oldData as DocumentDict<T>
        })
      })!
  }

  const unsubscribe = () => {
    if (!subscriptionDict[queryKeyJson]) {
      return
    }
    subscriptionListeners[queryKeyJson].delete(listenerIdRef.current)
    if (subscriptionListeners[queryKeyJson].size) {
      return
    }
    // console.log('[useDocuments] unsubscribe', queryKeyJson)
    getLastSequence().then((seq) => {
      sequenceDict[queryKeyJson] = seq
    })
    subscriptionDict[queryKeyJson]?.cancel()
    delete subscriptionDict[queryKeyJson]
  }

  useEffect(() => {
    subscribe()
    return unsubscribe
  }, [options?.enabled, isCouchMode])

  return query
}
