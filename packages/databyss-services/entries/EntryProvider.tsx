import React, { useCallback } from 'react'
import { debounce } from 'lodash'
import createReducer from '@databyss-org/services/lib/createReducer'
import { createContext, useContextSelector } from 'use-context-selector'
import reducer, { initialState as _initState } from './reducer'
import { onSearchEntries, onSetQuery, onClearCache } from './actions'
import { Text, EntryState } from '../interfaces'

const useReducer = createReducer()

interface PropsType {
  children: JSX.Element
  initialState: any
}

export interface EntryContextType {
  state: EntryState
  searchTerm: string
  clearSearchCache: () => void
  setQuery: (query: Text) => void
  searchCache: any
  searchEntries: (query: string) => void
}

export const EntryContext = createContext<EntryContextType>(null!)

const EntryProvider: React.FunctionComponent<PropsType> = ({
  children,
  initialState = _initState,
}) => {
  const [state, dispatch] = useReducer(reducer, initialState)
  const { searchCache, searchTerm } = state

  const searchEntries = useCallback(
    debounce((query: string) => {
      const _results = searchCache[query]
      if (!_results) {
        return dispatch(onSearchEntries(query))
      }
      return null
    }, 250),
    [searchCache]
  )

  const setQuery = (query: Text) => {
    dispatch(onSetQuery(query))
  }

  const clearSearchCache = () => {
    dispatch(onClearCache())
  }

  return (
    <EntryContext.Provider
      value={{
        state,
        searchTerm,
        clearSearchCache,
        setQuery,
        searchCache,
        searchEntries,
      }}
    >
      {children}
    </EntryContext.Provider>
  )
}

export const useEntryContext: <T>(selector: (c: EntryContextType) => T) => T = (
  selector
) => useContextSelector(EntryContext, selector)

export default EntryProvider
