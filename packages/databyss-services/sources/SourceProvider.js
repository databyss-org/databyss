import React, { useCallback } from 'react'
import { createContext, useContextSelector } from 'use-context-selector'
import createReducer from '@databyss-org/services/lib/createReducer'
import _ from 'lodash'
import reducer, { initialState } from './reducer'

import {
  fetchSource,
  saveSource,
  removeSourceFromCache,
  fetchAllSources,
  fetchPageSources,
  fetchSourcesFromList,
  fetchSourceQuery,
} from './actions'

const useReducer = createReducer()

export const SourceContext = createContext()

const SourceProvider = ({ children, initialState, reducer }) => {
  const [state, dispatch] = useReducer(reducer, initialState)

  const { searchCache, cache } = state

  // provider methods
  const setSource = useCallback(
    source => {
      if (_.isEqual(cache[source._id], source)) {
        return
      }
      // add or update source and set cache value
      // add set timeout to prevent focus issue with line content editable on ta
      window.requestAnimationFrame(() => dispatch(saveSource(source)))
    },
    [cache]
  )

  const getSource = useCallback(
    id => {
      if (state.cache[id]) {
        return state.cache[id]
      }
      dispatch(fetchSource(id))
      return null
    },
    [cache]
  )

  const getAllSources = () => {
    dispatch(fetchAllSources())
  }

  const getPageSources = id => {
    dispatch(fetchPageSources(id))
  }

  const getSourcesFromList = list => {
    const _sourceList = list.filter(s => typeof state.cache[s] === 'undefined')
    if (_sourceList.length > 0) {
      dispatch(fetchSourcesFromList(_sourceList))
    }
  }

  const searchSource = useCallback(
    _.debounce(query => {
      if (!query) return null
      if (state.searchCache[query]) {
        return state.searchCache[query]
      }

      dispatch(fetchSourceQuery(query))
      return null
    }, 750),
    [searchCache]
  )

  const getSearchCache = useCallback(query => searchCache[query], [
    // does a deep compare
    JSON.stringify(searchCache),
  ])

  const removeCacheValue = id => {
    if (state.cache[id]) {
      dispatch(removeSourceFromCache(id))
    }
  }

  return (
    <SourceContext.Provider
      value={{
        state,
        getSource,
        setSource,
        removeCacheValue,
        getAllSources,
        getPageSources,
        getSourcesFromList,
        searchSource,
        getSearchCache,
      }}
    >
      {children}
    </SourceContext.Provider>
  )
}

// export const useSourceContext = () => useContext(SourceContext)

export const useSourceContext = (selector = x => x) =>
  SourceContext && useContextSelector(SourceContext, selector)

SourceProvider.defaultProps = {
  initialState,
  reducer,
}

export default SourceProvider
