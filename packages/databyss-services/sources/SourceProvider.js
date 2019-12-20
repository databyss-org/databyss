import React, { createContext, useContext } from 'react'
import ErrorFallback from '@databyss-org/ui/components/Notify/ErrorFallback'
import Loading from '@databyss-org/ui/components/Notify/LoadingFallback'
import createReducer from '@databyss-org/services/lib/createReducer'
import reducer, { initialState } from './reducer'

import { fetchSource, saveSource, removeSourceFromCache } from './actions'

const useReducer = createReducer()

export const SourceContext = createContext()

const SourceProvider = ({ children, initialState, reducer }) => {
  const [state, dispatch] = useReducer(reducer, initialState)

  // provider methods
  const setSource = source => {
    // add or update source and set cache value
    dispatch(saveSource(source))
  }

  const getSource = id => {
    if (state.cache[id]) {
      return state.cache[id]
    }
    dispatch(fetchSource(id))
    return null
  }

  const removeCacheValue = id => {
    if (state.cache[id]) {
      dispatch(removeSourceFromCache(id))
    }
  }

  const getSources = () => {
    return state.cache
  }

  return (
    <SourceContext.Provider
      value={{ getSource, setSource, removeCacheValue, getSources }}
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

export const withSource = Wrapped => ({ sourceId, ...others }) => {
  const { getSource } = useSourceContext()
  const source = getSource(sourceId)

  if (source instanceof Error) {
    return <ErrorFallback error={source} />
  }

  return source ? <Wrapped source={source} {...others} /> : <Loading />
}

export default SourceProvider
