import { useState } from 'react'
import { useQuery, useQueryClient } from 'react-query'
import { searchEntries } from '../entries'
import { SearchEntriesResultPage } from '../entries/lib/searchEntries'
import { usePages } from './'

export const useSearchEntries = (searchQuery: string) => {
  const pagesRes = usePages()

  const queryKey = ['searchEntries', searchQuery]
  const query = useQuery<SearchEntriesResultPage[]>(
    queryKey,
    async () => {
      const results = await searchEntries(
        searchQuery,
        Object.values(pagesRes.data!)
      )
      return results
    },
    {
      enabled: pagesRes.isSuccess,
    }
  )

  return query
}
