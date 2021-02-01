import { useEffect } from 'react'
import { useQuery, useQueryClient, QueryObserverResult } from 'react-query'
import { DocumentDict, Document } from '@databyss-org/services/interfaces'
import PouchDB from 'pouchdb'
import { dbRef } from '../db'
import { DocumentArrayToDict } from './utils'

export interface QueryOptions {
  includeIds?: string[] | null
}

export interface IncludeFromResultOptions<RT extends Document> {
  result: QueryObserverResult<DocumentDict<RT>>
  resultToBlockId: (doc: RT) => string
}

export interface UseDocumentsOptions<RT extends Document> extends QueryOptions {
  includeFromResults?: IncludeFromResultOptions<RT>
}

export const useDocuments = <T extends Document, RT extends Document>(
  queryKey: string,
  selector: PouchDB.Find.Selector,
  options?: UseDocumentsOptions<RT>
) => {
  const queryOptions: QueryOptions = {
    includeIds: null,
  }
  const queryClient = useQueryClient()

  if (options?.includeFromResults) {
    queryOptions.includeIds = Object.values(
      options.includeFromResults.result.data!
    ).map(options?.includeFromResults.resultToBlockId)
    selector._id = {
      $in: queryOptions.includeIds,
    }
  }

  console.log('useDocuments.selector', selector)
  const query = useQuery<DocumentDict<T>>(
    [queryKey, queryOptions],
    () =>
      new Promise<DocumentDict<T>>((resolve, reject) =>
        dbRef.current
          .find({ selector })
          .then((res) => resolve(DocumentArrayToDict(res.docs)))
          .catch((err) => reject(err))
      ),
    {
      enabled:
        !options?.includeFromResults ||
        options?.includeFromResults?.result.isSuccess,
    }
  )

  useEffect(() => {
    console.log('useDocuments.subscribe', queryKey)
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
          console.log('useDocuments.invalidateOne', queryKey)
          queryClient.setQueryData<DocumentDict<T>>(queryKey, (oldData) => {
            oldData![change.doc._id] = change.doc
            return oldData as DocumentDict<T>
          })
        }
      })
    return () => {
      // on unmount, stop listening to pouch changes and invalidate the cache
      console.log('useDocuments.unsubscribe', queryKey)
      changes.cancel()
      queryClient.invalidateQueries(queryKey)
    }
  }, [])

  return query
}
