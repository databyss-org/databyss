import { useQuery } from '@tanstack/react-query'
import { searchEntries } from '../entries'
import {
  PouchDbSearchRow,
  SearchEntriesResultPage,
} from '../entries/lib/searchEntries'
import { usePages } from './'
import { useDocuments } from './useDocuments'
import { Block } from '../../../databyss-services/interfaces'
import { searchText } from '../utils'
import { couchDbRef } from '../../couchdb/couchdb'

const useSearchText = (searchQuery: string, localSearch: boolean = true) => {
  const _searchQuery = decodeURIComponent(searchQuery)
  const queryKey = ['searchText', searchQuery]

  const query = useQuery<PouchDbSearchRow[]>({
    queryKey,
    queryFn: async () => {
      if (localSearch) {
        const _res = await searchText({
          query: _searchQuery,
        })
        return _res.rows as PouchDbSearchRow[]
      }
      return couchDbRef.current?.search({ query: _searchQuery })!
    },
    staleTime: 5000,
  })

  return query
}

export const useSearchEntries = (searchQuery: string) => {
  const pagesRes = usePages()
  const searchTextRes = useSearchText(searchQuery)

  let docIds: string[] = []
  if (searchTextRes.isSuccess) {
    docIds = searchTextRes.data.map((row) => row.id)
  }

  const blocksRes = useDocuments<Block>(docIds, {
    enabled: searchTextRes.isSuccess,
  })

  const queryKey = [
    'searchEntries',
    searchQuery,
    searchTextRes.dataUpdatedAt,
    pagesRes.dataUpdatedAt,
    blocksRes.dataUpdatedAt,
  ]

  const query = useQuery<SearchEntriesResultPage[]>({
    queryKey,
    queryFn: async () => {
      const results = await searchEntries({
        encodedQuery: searchQuery,
        results: searchTextRes.data!,
        pages: Object.values(pagesRes.data!),
        blocks: blocksRes.data!,
        localSearch: true,
      })
      return results
    },
    enabled:
      pagesRes.isSuccess && blocksRes.isSuccess && searchTextRes.isSuccess,
    // gcTime: 5000,
  })

  return query
}
