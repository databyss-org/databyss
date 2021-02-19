import React, { useState } from 'react'
import { createContext, useContextSelector } from 'use-context-selector'

export interface SearchContextType {
  searchTerm: string
  setQuery: (query: string) => void
}

export const SearchContext = createContext<SearchContextType>(null!)

export const SearchProvider = ({ children }) => {
  const [searchTerm, setSearchTerm] = useState('')

  const setQuery = (query: string) => {
    setSearchTerm(query)
  }

  return (
    <SearchContext.Provider
      value={{
        searchTerm,
        setQuery,
      }}
    >
      {children}
    </SearchContext.Provider>
  )
}

export const useSearchContext: <T>(
  selector: (c: SearchContextType) => T
) => T = (selector) => useContextSelector(SearchContext, selector)
