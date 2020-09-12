import React, { useCallback } from 'react'
import { createContext, useContextSelector } from 'use-context-selector'
import createReducer from '@databyss-org/services/lib/createReducer'
import _ from 'lodash'
import reducer, { initialState } from './reducer'
import {
  ResourceResponse,
  Source,
  SourceState,
  Author,
  SourceCitationHeader,
} from '../interfaces'

import {
  fetchSource,
  saveSource,
  removeSourceFromCache,
  fetchAuthorHeaders,
  fetchSourceCitations,
  removePageFromHeaders,
  addPageToHeaders,
} from './actions'

interface PropsType {
  children: JSX.Element
  initialState: SourceState
}

interface ContextType {
  state: SourceState
  getSource: (id: string) => ResourceResponse<Source>
  setSource: (source: Source) => void
  removeCacheValue: (id: string) => void
  getAuthors: () => ResourceResponse<Author[]>
  getSourceCitations: () => ResourceResponse<SourceCitationHeader[]>
  removePageFromCacheHeader: (id: string, pageId: string) => void
  addPageToCacheHeader: (id: string, pageId: string) => void
}

const useReducer = createReducer()
export const SourceContext = createContext<ContextType | null>(null)

const SourceProvider: React.FunctionComponent<PropsType> = ({
  children,
  initialState,
}: PropsType) => {
  const [state, dispatch] = useReducer(reducer, initialState)

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
      if (state.cache[id]) {
        return state.cache[id]
      }
      dispatch(fetchSource(id))
      return null
    },
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

  const removePageFromCacheHeader = useCallback(
    (id: string, pageId: string) => dispatch(removePageFromHeaders(id, pageId)),
    [state.citationHeaderCache, state.citationHeaderCache]
  )

  const addPageToCacheHeader = useCallback(
    (id: string, pageId: string) => dispatch(addPageToHeaders(id, pageId)),
    [state.citationHeaderCache, state.citationHeaderCache]
  )

  const getSourceCitations = useCallback(
    (): ResourceResponse<SourceCitationHeader> => {
      if (state.citationHeaderCache) {
        return state.citationHeaderCache
      }

      dispatch(fetchSourceCitations())
      return null
    },
    [state.citationHeaderCache]
  )

  const getAuthors = useCallback(
    (): ResourceResponse<Author[]> => {
      if (state.authorsHeaderCache) {
        return state.authorsHeaderCache
      }

      dispatch(fetchAuthorHeaders())
      return null
    },
    [state.authorsHeaderCache]
  )

  return (
    <SourceContext.Provider
      value={{
        state,
        getSource,
        setSource,
        removeCacheValue,
        getAuthors,
        getSourceCitations,
        removePageFromCacheHeader,
        addPageToCacheHeader,
      }}
    >
      {children}
    </SourceContext.Provider>
  )
}

export const useSourceContext = (selector = x => x) =>
  useContextSelector(SourceContext, selector)

SourceProvider.defaultProps = {
  initialState,
}

export default SourceProvider
