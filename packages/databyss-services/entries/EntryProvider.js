import React, { useCallback } from 'react'
import createReducer from '@databyss-org/services/lib/createReducer'
import { createContext, useContextSelector } from 'use-context-selector'
import { debounce } from 'lodash'
import reducer, { initialState } from './reducer'
import { onSearchEntries, onSetQuery, onClearCache } from './actions'

const useReducer = createReducer()

export const EntryContext = createContext()

const EntryProvider = ({ children, initialState, reducer }) => {
  const [state, dispatch] = useReducer(reducer, initialState)
  const { searchCache, searchTerm } = state

  const searchEntries = useCallback(
    debounce(query => {
      const _results = searchCache[query]
      if (!_results) {
        return dispatch(onSearchEntries(query))
      }
      return null
    }, 250),
    [searchCache]
  )

  const setQuery = query => {
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

export const useEntryContext = (selector = x => x) =>
  useContextSelector(EntryContext, selector)

EntryProvider.defaultProps = {
  initialState,
  reducer,
}

export default EntryProvider
