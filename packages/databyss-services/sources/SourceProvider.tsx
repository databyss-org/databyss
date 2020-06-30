import React, { createContext, useContext, useEffect } from 'react'
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
export const SourceContext = createContext<ContextType>()

const SourceProvider: React.FunctionComponent<PropsType> = ({
  children,
  initialState,
}: PropsType) => {
  const [state, dispatch] = useReducer(reducer, initialState)

  useEffect(() => () => console.log('SourceProvider.unmount', state.cache), [])

  // provider methods
  const setSource = (source: Source) => {
    if (_.isEqual(state.cache[source._id], source)) {
      return
    }
    // add or update source and set cache value
    // add set timeout to prevent focus issue with line content editable on ta
    window.requestAnimationFrame(() => dispatch(saveSource(source)))
  }

  const getSource = (id: string): ResourceResponse<Source> => {
    console.log('getSource', state.cache[id])
    if (state.cache[id]) {
      return state.cache[id]
    }
    dispatch(fetchSource(id))
    return null
  }

  const searchSource = _.debounce((query: string): ResourceResponse<
    SourceSearchResults
  > => {
    if (!query) return null
    if (state.searchCache[query]) {
      return state.searchCache[query]
    }

    dispatch(fetchSourceQuery(query))
    return null
  }, 750)

  const removeCacheValue = (id: string) => {
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
