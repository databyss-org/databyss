import { useEffect } from 'react'
import { useQuery, useQueryClient } from 'react-query'
import PouchDB from 'pouchdb'
import { dbRef } from '../db'
import { searchEntries } from '../entries'
import { SearchEntriesResultPage } from '../entries/lib/searchEntries'
import { DocumentType } from '../interfaces'
import { usePages } from './'
import { CouchDb } from '../../couchdb-client/couchdb'
import { useDocuments } from './useDocuments'
import { Block } from '../../../databyss-services/interfaces'

const changesRef: { current: PouchDB.Core.Changes<any> | undefined } = {
  current: undefined,
}

export const useSearchEntries = (searchQuery: string) => {
  const pagesRes = usePages()
  const blocksRes = useDocuments<Block>({
    doctype: DocumentType.Block,
  })
  const queryClient = useQueryClient()

  const queryKey = ['searchEntries', searchQuery]
  const query = useQuery<SearchEntriesResultPage[]>(
    queryKey,
    async () => {
      const results = await searchEntries(
        searchQuery,
        Object.values(pagesRes.data!),
        blocksRes.data!
      )
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
  }, [])

  return query
}
