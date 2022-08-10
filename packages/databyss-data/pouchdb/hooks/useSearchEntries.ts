import { useEffect } from 'react'
import { useQuery, useQueryClient } from 'react-query'
import { useNotifyContext } from '@databyss-org/ui/components/Notify/NotifyProvider'
import PouchDB from 'pouchdb'
import { dbRef, waitForPouchDb } from '../db'
import { searchEntries } from '../entries'
import { SearchEntriesResultPage } from '../entries/lib/searchEntries'
import { DocumentType } from '../interfaces'
import { usePages } from './'
import { useDocuments } from './useDocuments'
import { Block } from '../../../databyss-services/interfaces'
import { CouchDb } from '../../couchdb-client/couchdb'

const changesRef: { current: PouchDB.Core.Changes<any> | undefined } = {
  current: undefined,
}

// let firstSearchInProgress: boolean = false
let firstSearchComplete: boolean = false

export const useSearchEntries = (searchQuery: string) => {
  const { isOnline } = useNotifyContext()
  const pagesRes = usePages()
  const blocksRes = useDocuments<Block>({
    doctype: DocumentType.Block,
  })
  const queryClient = useQueryClient()

  const queryKey = ['searchEntries', searchQuery]
  const query = useQuery<SearchEntriesResultPage[]>(
    queryKey,
    async () => {
      if (!(await waitForPouchDb())) {
        return []
      }
      const results = await searchEntries({
        encodedQuery: searchQuery,
        pages: Object.values(pagesRes.data!),
        blocks: blocksRes.data!,
        onUpdated: (_results) => {
          queryClient.setQueryData(queryKey, _results)
        },
        allowStale: firstSearchComplete,
        localSearch: !isOnline,
      })
      firstSearchComplete = true
      return results
    },
    {
      enabled: pagesRes.isSuccess && blocksRes.isSuccess,
    }
  )

  // watch for changes in pouch and reset cache when necessary
  useEffect(() => {
    if (dbRef.current instanceof CouchDb) {
      return
    }
    if (changesRef.current) {
      // already subscribed
      return
    }

    changesRef.current = dbRef
      .current!.changes({
        since: 'now',
        live: true,
        include_docs: true,
      })
      .on('change', (change) => {
        if (
          change.doc?.doctype === DocumentType.Block ||
          change.doc?.doctype === DocumentType.Page
        ) {
          queryClient.removeQueries(['searchEntries'])
        }
      })
  }, [dbRef.current])

  return query
}
