import React, { createContext, useContext } from 'react'
import ErrorFallback from '@databyss-org/ui/components/Notify/ErrorFallback'
import Loading from '@databyss-org/ui/components/Notify/LoadingFallback'
import createReducer from '@databyss-org/services/lib/createReducer'
import _ from 'lodash'

import reducer, { initialState } from './reducer'

import { onSearchEntries } from './actions'
import makeLoader from '@databyss-org/ui/components/Loaders/makeLoader'

const useReducer = createReducer()

export const EntryContext = createContext()

const EntryProvider = ({ children, initialState, reducer }) => {
  const [state, dispatch] = useReducer(reducer, initialState)
  const { searchCache } = state

  const searchEntries = _.debounce(query => {
    const _results = searchCache[query]
    if (!_results) {
      return dispatch(onSearchEntries(query))
    }
    return
  }, 250)

  return (
    <EntryContext.Provider
      value={{
        state,
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

export const EntrySearchLoader = makeLoader(({ query }) => {
  const { searchEntries, searchCache } = useEntryContext()
  searchEntries(query)

  return searchCache[query]
})

export default EntryProvider
