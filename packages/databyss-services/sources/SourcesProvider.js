import React, { createContext, useContext, useState, useEffect } from 'react'
import { Text, View } from '@databyss-org/ui/primitives'
import Loading from '@databyss-org/ui/components/Loading'
import createReducer from '@databyss-org/services/lib/createReducer'
import { SourceNotFoundError } from './SourceNotFoundError'
import { initialState } from './reducer'
import { fetchSource, saveSource } from './actions'

const useReducer = createReducer()

export const SourceContext = createContext()

const Error = () => (
  <View height="100%">
    <View alignSelf="center" justifyContent="center">
      <Text>No Source Found</Text>
    </View>
  </View>
)

const SourceProvider = ({ children, initialState, reducer }) => {
  const [state, dispatch] = useReducer(reducer, initialState)

  // provider methods
  const setSource = source => {
    // find and update source or
    // create new cache value and append new source
    dispatch(saveSource(source))
  }

  const getSource = id => {
    if (state.cache[id]) {
      return state.cache[id]
    }
    dispatch(fetchSource(id))
    return null
  }

  return (
    <SourceContext.Provider
      value={[getSource, setSource, { cache: state.cache }]}
    >
      {children}
    </SourceContext.Provider>
  )
}

export const useSourceContext = () => useContext(SourceContext)

SourceProvider.defaultProps = {
  initialState,
}

export const withSource = Wrapped => ({ sourceId, ...others }) => {
  const [getSource, , state] = useSourceContext()
  const [source, setSourcState] = useState(getSource(sourceId))

  useEffect(
    () => {
      setSourcState(state.cache[sourceId])
    },
    [state.cache[sourceId]]
  )

  if (source instanceof SourceNotFoundError) {
    return <Error />
  }

  return source ? <Wrapped source={source} {...others} /> : <Loading />
}

export default SourceProvider
