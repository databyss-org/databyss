import { useEffect } from 'react'
import { useQuery, useQueryClient } from 'react-query'
import { DocumentDict, Document } from '@databyss-org/services/interfaces'
import PouchDB from 'pouchdb'
import { dbRef } from '../db'
import { DocumentArrayToDict } from './utils'

export const useDocuments = <T extends Document>(
  queryKey: string,
  selector: PouchDB.Find.Selector
) => {
  const queryClient = useQueryClient()
  const query = useQuery<DocumentDict<T>>(
    queryKey,
    () =>
      new Promise<DocumentDict<T>>((resolve, reject) =>
        dbRef.current
          .find({ selector })
          .then((res) => resolve(DocumentArrayToDict(res.docs)))
          .catch((err) => reject(err))
      )
  )

  useEffect(() => {
    console.log('useDocuments.subscribe')
    const changes = dbRef.current
      .changes({
        since: 'now',
        live: true,
      })
      .on('change', (change) => {
        console.log('useDocuments.change', change)
        if (
          change.deleted ||
          !queryClient.getQueryData<DocumentDict<T>>(queryKey)?.[change.id]
        ) {
          // doc was added or removed, refresh list
          queryClient.invalidateQueries(queryKey)
        }
        // else the doc was modified, so the cache at the last value
        // it is up to another query hook to update single block relations
      })
    return () => {
      console.log('useDocuments.unsubscribe')
      changes.cancel()
    }
  }, [])

  return query
}
