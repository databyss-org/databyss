import React, { createContext, useContext } from 'react'
import ErrorFallback from '@databyss-org/ui/components/Notify/ErrorFallback'
import Loading from '@databyss-org/ui/components/Notify/LoadingFallback'
import createReducer from '@databyss-org/services/lib/createReducer'
import _ from 'lodash'

import reducer, { initialState } from './reducer'

import { onSearchEntries } from './actions'
import { ResourcePending } from '../lib/ResourcePending'

const useReducer = createReducer()

export const EntryContext = createContext()

const EntryProvider = ({ children, initialState, reducer }) => {
  const [state, dispatch] = useReducer(reducer, initialState)
  const { searchTerm, searchResults } = state

  // provider methods
  //   const setTopic = topic => {
  //     if (_.isEqual(state.cache[topic._id], topic)) {
  //       return
  //     }
  //     // add or update topic and set cache value
  //     // add set timeout to prevent focus issue with line content editable on tab
  //     window.requestAnimationFrame(() => dispatch(saveTopic(topic)))
  //   }

  //   const getTopic = id => {
  //     if (state.cache[id]) {
  //       return state.cache[id]
  //     }
  //     dispatch(fetchTopic(id))
  //     return null
  //   }
  const searchEntries = string => {
    if (searchTerm === string) {
      return
    }
    if (searchResults instanceof ResourcePending) {
      return
    }
    dispatch(onSearchEntries(string))
  }

  return (
    <EntryContext.Provider
      value={{
        state,
        searchTerm,
        searchResults,
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

export const EntrySearchLoader = ({ query, children }) => {
  const { searchEntries, state } = useEntryContext()
  searchEntries(query)

  if (state.searchResults instanceof Error) {
    return <ErrorFallback error={state.searchResults} />
  }

  if (typeof children !== 'function') {
    throw new Error('Child must be a function')
  }

  if (state.searchResults instanceof ResourcePending) {
    return <Loading />
  }

  return children(state.searchResults)
}

// export const withTopic = Wrapped => ({ topicId, ...others }) => (
//   <TopicLoader topicId={topicId}>
//     {topic => <Wrapped topic={topic} {...others} />}
//   </TopicLoader>
// )

export default EntryProvider
