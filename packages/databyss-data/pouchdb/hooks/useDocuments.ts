import { useEffect } from 'react'
import { useQuery, useQueryClient } from 'react-query'
import { DocumentDict, Document } from '@databyss-org/services/interfaces'
import PouchDB from 'pouchdb'

import { dbRef } from '../db'
import { CouchDb } from '../../couchdb-client/couchdb'
import { DocumentArrayToDict } from './utils'

export interface QueryOptions {
  includeIds?: string[] | null
}

export interface UseDocumentsOptions extends QueryOptions {
  enabled?: boolean
}

const subscriptionDict: { [selector: string]: PouchDB.Core.Changes<any> } = {}

export const useDocuments = <T extends Document>(
  selector: PouchDB.Find.Selector,
  options: UseDocumentsOptions = { enabled: true }
) => {
  console.log('SELECTOR', selector)
  const queryClient = useQueryClient()
  const queryOptions: QueryOptions = {
    includeIds: options.includeIds,
  }

  if (queryOptions.includeIds) {
    selector._id = {
      $in: queryOptions.includeIds,
    }
  }

  const selectorString = JSON.stringify(selector)

  const queryKey = selectorString

  // console.log('useDocuments.selector', selector)
  const query = useQuery<DocumentDict<T>>(
    queryKey,
    () =>
      new Promise<DocumentDict<T>>((resolve, reject) => {
        // console.log('useDocuments.fetch', selector)
        dbRef
          .current!.find({ selector })
          .then((res: any) => resolve(DocumentArrayToDict(res.docs)))
          .catch((err) => reject(err))
      }),
    {
      enabled: options.enabled,
    }
  )

  useEffect(() => {
    if (dbRef.current instanceof CouchDb) {
      return
    }
    // console.log('useDocuments.subscribe', queryKey, selector)

    if (subscriptionDict[selectorString]) {
      return
    }
    subscriptionDict[selectorString] = dbRef.current
      ?.changes({
        since: 'now',
        live: true,
        include_docs: true,
        selector,
      })
      .on('change', (change) => {
        console.log('POUCH CHANGE', change)
        queryClient.setQueryData<DocumentDict<T>>(queryKey, (oldData) => {
          if (!oldData) {
            return {}
          }
          if (change.deleted) {
            // remove from cache
            // console.log('useDocuments.delete', change.doc)
            delete oldData![change.doc._id]
          } else {
            // add or update cache
            // console.log('useDocuments.addOrUpdate', change.doc)
            oldData![change.doc._id] = change.doc
          }
          return oldData as DocumentDict<T>
        })
      })!
    // console.log('useDocuments.subscribe', subscriptionDict)
  }, [])

  return query
}
