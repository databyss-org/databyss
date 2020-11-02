import _ from 'lodash'
import { createContext, useContextSelector } from 'use-context-selector'
import React, { useCallback } from 'react'

import createReducer from '@databyss-org/services/lib/createReducer'

import {
  Author,
  ResourceResponse,
  Source,
  SourceCitationHeader,
  SourceState,
} from '../interfaces'

import {
  addPageToHeaders,
  fetchAuthorHeaders,
  fetchSource,
  fetchSourceCitations,
  removePageFromHeaders,
  removeSourceFromCache,
  saveSource,
} from './actions'
import { SET_PREFERRED_CITATION_STYLE } from './constants'
import reducer, { initialState } from './reducer'

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
  resetSourceHeaders: () => void
}

const useReducer = createReducer()
export const SourceContext = createContext<ContextType | null>(null)

const SourceProvider: React.FunctionComponent<PropsType> = ({
  children,
  initialState,
}: PropsType) => {
  const [state, dispatch] = useReducer(reducer, initialState)

  // provider methods - source
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

  // provider methods - cache
  const removeCacheValue = useCallback(
    (id: string) => {
      if (state.cache[id]) {
        dispatch(removeSourceFromCache(id))
      }
    },
    [state.cache]
  )

  // provider methods - header
  const removePageFromCacheHeader = useCallback(
    (id: string, pageId: string) => dispatch(removePageFromHeaders(id, pageId)),
    [state.citationHeaderCache, state.citationHeaderCache]
  )

  const addPageToCacheHeader = useCallback(
    (id: string, pageId: string) => dispatch(addPageToHeaders(id, pageId)),
    [state.citationHeaderCache, state.citationHeaderCache]
  )

  const resetSourceHeaders = () => {
    dispatch(fetchAuthorHeaders())
    dispatch(fetchSourceCitations())
  }

  // provider methods - citations
  const getSourceCitations = useCallback(
    (): ResourceResponse<SourceCitationHeader> => {
      if (state.citationHeaderCache) {
        return state.citationHeaderCache
      }
      dispatch(fetchSourceCitations())
      return null
    },
    [state]
  )

  const setPreferredCitationStyle = useCallback(
    (styleId: string) => {
      dispatch({ type: SET_PREFERRED_CITATION_STYLE, payload: { styleId } })
    },
    [dispatch]
  )

  const getPreferredCitationStyle = () => state.preferredCitationStyle

  // provider methods - citations
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
        resetSourceHeaders,
        setPreferredCitationStyle,
        getPreferredCitationStyle,
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
