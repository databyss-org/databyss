import React, { createContext, useContext } from 'react'
import ErrorFallback from '@databyss-org/ui/components/Notify/ErrorFallback'
import Loading from '@databyss-org/ui/components/Notify/LoadingFallback'
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
} from './actions'

const useReducer = createReducer()

export const SourceContext = createContext()

const SourceProvider = ({ children, initialState, reducer }) => {
  const [state, dispatch] = useReducer(reducer, initialState)

  // provider methods
  const setSource = source => {
    if (_.isEqual(state.cache[source._id], source)) {
      return
    }
    // add or update source and set cache value
    // add set timeout to prevent focus issue with line content editable on tab
    window.requestAnimationFrame(() => dispatch(saveSource(source)))
  }

  const getSource = id => {
    if (state.cache[id]) {
      return state.cache[id]
    }
    dispatch(fetchSource(id))
    return null
  }

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
      }}
    >
      {children}
    </SourceContext.Provider>
  )
}

export const useSourceContext = () => useContext(SourceContext)

SourceProvider.defaultProps = {
  initialState,
  reducer,
}

export const SourceLoader = ({ sourceId, children }) => {
  const { getSource } = useSourceContext()
  const source = getSource(sourceId)

  if (source instanceof Error) {
    return <ErrorFallback error={source} />
  }
  // const child = React.Children.only(children)
  if (typeof children !== 'function') {
    throw new Error('Child must be a function')
  }
  return source ? children(source) : <Loading />
}

export const withSource = Wrapped => ({ sourceId, ...others }) => (
  <SourceLoader sourceId={sourceId}>
    {source => <Wrapped source={source} {...others} />}
  </SourceLoader>
)

export default SourceProvider
