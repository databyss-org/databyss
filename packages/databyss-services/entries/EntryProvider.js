import React, { createContext, useContext } from 'react'
import createReducer from '@databyss-org/services/lib/createReducer'
import _ from 'lodash'
import reducer, { initialState } from './reducer'
import { onSearchEntries, onSetQuery, onClearCache } from './actions'

const useReducer = createReducer()

export const EntryContext = createContext()

const EntryProvider = ({ children, initialState, reducer }) => {
  const [state, dispatch] = useReducer(reducer, initialState)
  const { searchCache, searchTerm } = state

  // TODO: memoize for debounce to work

  // const searchEntries = _.debounce(query => {
  //   const _results = searchCache[query]
  //   if (!_results) {
  //     return dispatch(onSearchEntries(query))
  //   }
  //   return null
  // }, 250)

  const searchEntries = query => {
    const _results = searchCache[query]
    if (!_results) {
      return dispatch(onSearchEntries(query))
    }
    return null
  }

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

export const useEntryContext = () => useContext(EntryContext)

EntryProvider.defaultProps = {
  initialState,
  reducer,
}

export default EntryProvider
