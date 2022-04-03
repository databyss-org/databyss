import { useEffect } from 'react'
import { useQuery, useQueryClient, UseQueryOptions } from 'react-query'
import { DocumentDict, Document } from '@databyss-org/services/interfaces'
import PouchDB from 'pouchdb'

import { dbRef } from '../db'
import { CouchDb } from '../../couchdb-client/couchdb'
import { DocumentArrayToDict } from './utils'

const subscriptionDict: { [selector: string]: boolean } = {}

export const useDocuments = <T extends Document>(
  selectorOrIdList: PouchDB.Find.Selector | string[],
  options: UseQueryOptions = { enabled: true }
) => {
  const queryClient = useQueryClient()

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
              resolve(DocumentArrayToDict(res.rows.map((r) => r.doc)))
            )
            .catch((err) => reject(err))
        } else {
          dbRef.current
            ?.find({ selector: selector! })
            .then((res) => resolve(DocumentArrayToDict(res.docs)))
            .catch((err) => reject(err))
        }
      }),
    options as UseQueryOptions<DocumentDict<T>>
  )

  useEffect(() => {
    if (!options?.enabled) {
      return
    }

    if (dbRef.current instanceof CouchDb) {
      return
    }

    if (subscriptionDict[queryKey]) {
      return
    }
    subscriptionDict[queryKey] = true
    dbRef.current
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
    // console.log('[useDocuments] subscribe', queryKey, selector, dbRef.current)
  }, [options?.enabled])

  return query
}
