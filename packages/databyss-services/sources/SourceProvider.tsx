import _ from 'lodash'
import { createContext, useContextSelector } from 'use-context-selector'
import React, { useCallback } from 'react'
import * as services from '.'

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
import reducer, { initialState as _initState } from './reducer'

interface PropsType {
  children: JSX.Element
  initialState: SourceState
}

interface ContextType {
  state: SourceState
  setSource: (source: Source) => void
  removeCacheValue: (id: string) => void
  getAuthors: () => ResourceResponse<Author[]>
  getSourceCitations: () => ResourceResponse<SourceCitationHeader[]>
  removePageFromCacheHeader: (id: string, pageId: string) => void
  addPageToCacheHeader: (id: string, pageId: string) => void
  resetSourceHeaders: () => void
  setPreferredCitationStyle: (styleId: string) => void
  getPreferredCitationStyle: () => void
}

const useReducer = createReducer()
export const SourceContext = createContext<ContextType>(null!)

const SourceProvider: React.FunctionComponent<PropsType> = ({
  children,
  initialState = _initState,
}: PropsType) => {
  const [state, dispatch] = useReducer(reducer, initialState)

  // provider methods - source
  const setSource = services.setSource

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
  const getSourceCitations = useCallback((): ResourceResponse<
    SourceCitationHeader
  > => {
    if (state.citationHeaderCache) {
      return state.citationHeaderCache
    }
    dispatch(fetchSourceCitations())
    return null
  }, [state])

  const setPreferredCitationStyle = useCallback(
    (styleId: string) => {
      // error checks
      const typeOfStyleId = typeof styleId
      if (typeOfStyleId !== 'string') {
        throw new Error(
          `setPreferredCitationStyle() expected 'styleId' to be a string.
          Received "${typeOfStyleId}".`
        )
      }
      // dispatch
      dispatch({ type: SET_PREFERRED_CITATION_STYLE, payload: { styleId } })
    },
    [dispatch]
  )

  const getPreferredCitationStyle = () => state.preferredCitationStyle

  // provider methods - citations
  const getAuthors = useCallback((): ResourceResponse<Author[]> => {
    if (state.authorsHeaderCache) {
      return state.authorsHeaderCache
    }

    dispatch(fetchAuthorHeaders())
    return null
  }, [state.authorsHeaderCache])

  return (
    <SourceContext.Provider
      value={{
        state,
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

export const useSourceContext = (selector = (x: ContextType) => x) =>
  useContextSelector(SourceContext, selector)

export default SourceProvider
