import React, { createContext, useContext } from 'react'
import ErrorFallback from '@databyss-org/ui/components/Notify/ErrorFallback'
import Loading from '@databyss-org/ui/components/Notify/LoadingFallback'
import createReducer from '@databyss-org/services/lib/createReducer'
import { ResourceNotFoundError } from '../lib/ResourceNotFoundError'
import { initialState } from './reducer'
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

  return (
    <SourceContext.Provider value={[getSource, setSource, removeCacheValue]}>
      {children}
    </SourceContext.Provider>
  )
}

export const useSourceContext = () => useContext(SourceContext)

SourceProvider.defaultProps = {
  initialState,
}

export const withSource = Wrapped => ({ sourceId, ...others }) => {
  const [getSource] = useSourceContext()

  const source = getSource(sourceId)

  if (source instanceof ResourceNotFoundError) {
    return <ErrorFallback message="No Source Found" />
  }

  if (source instanceof Error) {
    // throw to the source to trigger the "unexpected error" dialog
    throw source
  }

  return source ? <Wrapped source={source} {...others} /> : <Loading />
}

export default SourceProvider
