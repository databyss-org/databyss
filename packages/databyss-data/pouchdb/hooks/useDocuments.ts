// import { useEffect, useRef } from 'react'
import {
  QueryKey,
  useQuery,
  // useQueryClient,
  UseQueryOptions,
  UseQueryResult,
} from '@tanstack/react-query'
import { DocumentDict, Document } from '@databyss-org/services/interfaces'
import PouchDB from 'pouchdb'

import {
  dbRef,
  // getLastSequence
} from '../db'
// import { CouchDb } from '../../couchdb/couchdb'
import { DocumentArrayToDict } from './utils'
import {
  // applyDefaultUseDocumentOptions,
  UseDocumentOptions,
} from './useDocument'
import { useEffect, useRef } from 'react'
// import { uid } from '../../lib/uid'
// import { docsEqual } from '../compare'

// const subscriptionDict: {
//   [selector: string]: PouchDB.Core.Changes<any> | undefined
// } = {}
// const sequenceDict: { [selector: string]: string | number } = {}
// const subscriptionListeners: { [selector: string]: Set<string> } = {}

export const useDocuments = <T extends Document>(
  selectorOrIdList: PouchDB.Find.Selector | string[],
  options: UseDocumentOptions = {}
): UseQueryResult<DocumentDict<T>, Error> => {
  // const listenerIdRef = useRef<string>(uid())
  // const queryClient = useQueryClient()
  // const { isCouchMode } = useDatabaseContext()
  // const _options = applyDefaultUseDocumentOptions(options)

  const prevQuery = useRef<UseQueryResult<DocumentDict<T>, Error> | null>(null)
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
  if (options.queryKey) {
    // console.log('[useDocuments] override queryKey', options.queryKey)
    queryKey = options.queryKey
  }
  // const queryKeyJson = JSON.stringify(queryKey)

  // console.log('useDocuments.selector', selector)
  const query = useQuery<DocumentDict<T>>({
    queryFn: () =>
      new Promise<DocumentDict<T>>((resolve, reject) => {
        // console.log('[useDocuments] fetch', queryKey)
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
    ...(options as UseQueryOptions<DocumentDict<T>>),
    queryKey,
  })

  useEffect(() => {
    prevQuery.current = null
  }, [options?.previousDeps])

  if (!query.data && options.previousIfNull && prevQuery.current) {
    return prevQuery.current
  }

  prevQuery.current = query

  return query
}
