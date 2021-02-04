import { useEffect } from 'react'
import { useQuery, useQueryClient, QueryObserverResult } from 'react-query'
import { DocumentDict, Document } from '@databyss-org/services/interfaces'
import PouchDB from 'pouchdb'
import { dbRef } from '../db'
import { DocumentArrayToDict } from './utils'

export interface QueryOptions {
  includeIds?: string[] | null
}

export interface IncludeFromResultOptions<T extends Document> {
  result: QueryObserverResult<DocumentDict<T>>
  resultToBlockId?: (doc: T) => string
}

export interface UseDocumentsOptions extends QueryOptions {
  includeFromResults?: IncludeFromResultOptions<any>
  enabled?: boolean
}

export const useDocuments = <T extends Document>(
  queryKey: unknown[],
  selector: PouchDB.Find.Selector,
  options: UseDocumentsOptions = { enabled: true }
) => {
  const queryClient = useQueryClient()
  const queryOptions: QueryOptions = {
    includeIds: options.includeIds,
  }
  const includeFromResults:
    | IncludeFromResultOptions<Document>
    | undefined = options.includeFromResults && {
    resultToBlockId: (b) => b._id,
    ...options.includeFromResults,
  }

  if (includeFromResults && includeFromResults.result.isSuccess) {
    queryOptions.includeIds = Object.values(includeFromResults.result.data!)
      .filter(includeFromResults.resultToBlockId!)
      .map(includeFromResults.resultToBlockId!)
  }
  if (queryOptions.includeIds) {
    selector._id = {
      $in: queryOptions.includeIds,
    }
  }
  queryKey.push(queryOptions)

  // console.log('useDocuments.selector', selector)
  const query = useQuery<DocumentDict<T>>(
    queryKey,
    () =>
      new Promise<DocumentDict<T>>((resolve, reject) => {
        console.log('useDocuments.fetch', selector)
        return dbRef.current
          .find({ selector })
          .then((res) => resolve(DocumentArrayToDict(res.docs)))
          .catch((err) => reject(err))
      }),
    {
      enabled:
        options.enabled &&
        (!options.includeFromResults ||
          options.includeFromResults?.result.isSuccess),
    }
  )

  useEffect(() => {
    // console.log('useDocuments.subscribe', queryKey, selector)
    const changes = dbRef.current
      .changes({
        since: 'now',
        live: true,
        include_docs: true,
        selector,
      })
      .on('change', (change) => {
        if (
          change.deleted ||
          !queryClient.getQueryData<DocumentDict<T>>(queryKey)?.[change.id]
        ) {
          // doc was added or removed, refresh list
          console.log('useDocuments.invalidateAll', queryKey)
          queryClient.invalidateQueries(queryKey)
        } else {
          // the doc was modified, so update the cache
          // console.log('useDocuments.invalidateOne', queryKey)
          queryClient.setQueryData<DocumentDict<T>>(queryKey, (oldData) => {
            oldData![change.doc._id] = change.doc
            return oldData as DocumentDict<T>
          })
        }
      })
    return () => {
      // on unmount, stop listening to pouch changes
      // console.log('useDocuments.unsubscribe', queryKey)
      changes.cancel()
      // queryClient.removeQueries(queryKey)
    }
  }, [])

  return query
}
