import { useQuery, useQueryClient } from '@tanstack/react-query'
// import { checkNetwork } from '@databyss-org/services/lib/request'
// import PouchDB from 'pouchdb'
// import { dbRef, waitForPouchDb } from '../db'
import { searchEntries } from '../entries'
import { SearchEntriesResultPage } from '../entries/lib/searchEntries'
// import { DocumentType } from '../interfaces'
import { usePages } from './'
import { useDocuments } from './useDocuments'
import { Block } from '../../../databyss-services/interfaces'
// import { CouchDb } from '../../couchdb/couchdb'
import { selectors } from '../selectors'

// const changesRef: { current: PouchDB.Core.Changes<any> | undefined } = {
//   current: undefined,
// }

// let firstSearchInProgress: boolean = false
// let firstSearchComplete: boolean = false

export const useSearchEntries = (searchQuery: string) => {
  const pagesRes = usePages()
  const blocksRes = useDocuments<Block>(selectors.BLOCKS)
  // const queryClient = useQueryClient()
  const queryKey = ['searchEntries', searchQuery]

  // watch for changes in pouch and reset cache when necessary
  // const subscribeOnce = () => {
  //   if (dbRef.current instanceof CouchDb) {
  //     return
  //   }
  //   if (changesRef.current) {
  //     // already subscribed
  //     return
  //   }

  //   changesRef.current = dbRef
  //     .current!.changes({
  //       since: 'now',
  //       live: true,
  //       include_docs: true,
  //     })
  //     .on('change', (change) => {
  //       if (
  //         ((change.doc?.doctype === DocumentType.Block ||
  //           change.doc?.doctype === DocumentType.Page) &&
  //           change.doc?.modifiedAt &&
  //           !change.doc?.accessedAt) ||
  //         change.doc?.modifiedAt > change.doc?.accessedAt
  //       ) {
  //         // reset after a delay so cloud index has time to reset
  //         setTimeout(() => {
  //           queryClient.resetQueries(['searchEntries'])
  //         }, 3000)
  //         changesRef.current?.cancel()
  //         changesRef.current = undefined
  //       }
  //     })
  // }

  const query = useQuery<SearchEntriesResultPage[]>(
    queryKey,
    async () => {
      // const isOnline = await checkNetwork()
      // subscribeOnce()
      // if (!isOnline && !(await waitForPouchDb())) {
      //   return []
      // }
      const results = await searchEntries({
        encodedQuery: searchQuery,
        pages: Object.values(pagesRes.data!),
        blocks: blocksRes.data!,
        // onUpdated: (_results) => {
        //   queryClient.setQueryData(queryKey, _results)
        // },
        // allowStale: firstSearchComplete,
        localSearch: true,
      })
      // firstSearchComplete = true
      return results
    },
    {
      enabled: pagesRes.isSuccess && blocksRes.isSuccess,
      cacheTime: 5000,
    }
  )

  return query
}
