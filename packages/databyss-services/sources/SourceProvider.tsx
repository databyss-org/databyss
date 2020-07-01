import React, { createContext, useContext, useEffect, useCallback } from 'react'
import createReducer from '@databyss-org/services/lib/createReducer'
import _ from 'lodash'
import reducer, { initialState } from './reducer'
import { ResourceResponse, Source, SourceState } from '../interfaces'

import {
  fetchSource,
  saveSource,
  removeSourceFromCache,
  fetchSourceQuery,
} from './actions'
import { SourceSearchResults } from '../interfaces/SourceState'

interface PropsType {
  children: JSX.Element
  initialState: SourceState
}

interface ContextType {
  state: SourceState
  getSource: (id: string) => ResourceResponse<Source>
  setSource: (source: Source) => void
  removeCacheValue: (id: string) => void
  searchSource: (query: string) => ResourceResponse<SourceSearchResults>
}

const useReducer = createReducer()
export const SourceContext = createContext<ContextType | null>(null)

const SourceProvider: React.FunctionComponent<PropsType> = ({
  children,
  initialState,
}: PropsType) => {
  const [state, dispatch] = useReducer(reducer, initialState)

  console.log('SourceProvider.render')

  useEffect(
    () => {
      console.log('SourceProvider.reducer')
      return () => console.log('SourceProvider.unmount')
    },
    [reducer]
  )

  // provider methods
  const setSource = useCallback(
    (source: Source) => {
      if (_.isEqual(state.cache[source._id], source)) {
        return
      }
      // add or update source and set cache value
      // add set timeout to prevent focus issue with line content editable on ta
      window.requestAnimationFrame(() => dispatch(saveSource(source)))
    },
    [state.cache]
  )

  const getSource = useCallback(
    (id: string): ResourceResponse<Source> => {
      console.log('getSource', state.cache[id])
      if (state.cache[id]) {
        return state.cache[id]
      }
      dispatch(fetchSource(id))
      return null
    },
    [state.cache]
  )

  const searchSource = useCallback(
    _.debounce((query: string): ResourceResponse<SourceSearchResults> => {
      if (!query) return null
      if (state.searchCache[query]) {
        return state.searchCache[query]
      }

      dispatch(fetchSourceQuery(query))
      return null
    }, 750),
    [state.cache]
  )

  const removeCacheValue = useCallback(
    (id: string) => {
      if (state.cache[id]) {
        dispatch(removeSourceFromCache(id))
      }
    },
    [state.cache]
  )

  return (
    <SourceContext.Provider
      value={{
        state,
        getSource,
        setSource,
        removeCacheValue,
        searchSource,
      }}
    >
      {children}
    </SourceContext.Provider>
  )
}

export const useSourceContext = () => useContext(SourceContext)

SourceProvider.defaultProps = {
  initialState,
}

export default SourceProvider
