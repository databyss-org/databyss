import {
  SearchTerm,
  splitSearchTerms,
} from '@databyss-org/data/couchdb-client/couchdb'
import React, { useState, useMemo } from 'react'
import { createContext, useContextSelector } from 'use-context-selector'

export interface SearchContextType {
  searchTerm: string
  normalizedStemmedTerms: SearchTerm[]
  setQuery: (query: string) => void
}

export const SearchContext = createContext<SearchContextType>(null!)

export const SearchProvider = ({ children }) => {
  const [searchTerm, setSearchTerm] = useState('')

  const setQuery = (query: string) => {
    setSearchTerm(query)
  }

  const normalizedStemmedTerms = useMemo(
    () => splitSearchTerms(searchTerm, { normalized: true, stemmed: true }),
    [searchTerm]
  )

  return (
    <SearchContext.Provider
      value={{
        searchTerm,
        setQuery,
        normalizedStemmedTerms,
      }}
    >
      {children}
    </SearchContext.Provider>
  )
}

export const useSearchContext: <T>(
  selector: (c: SearchContextType) => T
) => T = (selector) => useContextSelector(SearchContext, selector)
