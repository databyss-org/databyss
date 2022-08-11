import {
  SearchTerm,
  splitSearchTerms,
} from '@databyss-org/data/couchdb-client/couchdb'
import React, { useState, useMemo } from 'react'
import Snowball from 'snowball'
import { createContext, useContextSelector } from 'use-context-selector'

interface getSearchTermProps {
  normalized: boolean
  stemmed: boolean
}

export interface SearchContextType {
  searchTerm: string
  getSearchTerms: (p: getSearchTermProps) => SearchTerm[]
  normalizedStemmedTerms: SearchTerm[]
  setQuery: (query: string) => void
}

export const SearchContext = createContext<SearchContextType>(null!)

// init stemming
const stemmer = new Snowball('English')

export const SearchProvider = ({ children }) => {
  const [searchTerm, setSearchTerm] = useState('')

  const setQuery = (query: string) => {
    setSearchTerm(query)
  }

  const getSearchTerms = ({ normalized, stemmed }: getSearchTermProps) => {
    // console.log('[SearchProvider] getSearchTerms')
    const _terms = splitSearchTerms(searchTerm)

    return _terms.map((term) => {
      if (term.exact) {
        return term
      }
      if (normalized) {
        // normalize diactritics
        term.text = term.text.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      }
      if (stemmed) {
        // stem
        stemmer.setCurrent(term.text)
        stemmer.stem()
        term.text = stemmer.getCurrent()
      }
      return term
    })
  }

  const normalizedStemmedTerms = useMemo(
    () => getSearchTerms({ normalized: true, stemmed: true }),
    [searchTerm]
  )

  return (
    <SearchContext.Provider
      value={{
        searchTerm,
        setQuery,
        getSearchTerms,
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
