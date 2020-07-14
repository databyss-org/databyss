import produce, { Draft } from 'immer'
import {
  CACHE_SOURCE,
  REMOVE_SOURCE,
  CACHE_SOURCES,
  CACHE_SEARCH_QUERY,
  FETCH_SEARCH_QUERY,
  FETCH_AUTHOR_HEADERS,
  CACHE_AUTHOR_HEADERS,
  FETCH_SOURCE_CITATIONS,
  CACHE_SOURCE_CITATIONS,
} from './constants'
import { FSA, SourceState } from '../interfaces'
import { ResourcePending } from '../interfaces/ResourcePending'

export const initialState: SourceState = {
  cache: {},
  searchCache: {},
  authorsHeaderCache: null,
  sourceHeaderCache: null,
}

export default produce((draft: Draft<SourceState>, action: FSA) => {
  switch (action.type) {
    case CACHE_SOURCE: {
      draft.cache[action.payload.id] = action.payload.source
      break
    }
    case CACHE_SOURCES: {
      const { sources } = action.payload
      Object.keys(sources).forEach(s => {
        draft.cache[s] = sources[s]
      })
      break
    }
    case REMOVE_SOURCE: {
      delete draft.cache[action.payload.id]
      break
    }
    case FETCH_SEARCH_QUERY: {
      const { query } = action.payload
      draft.searchCache[query] = new ResourcePending()
      break
    }
    case CACHE_SEARCH_QUERY: {
      const { query } = action.payload
      draft.searchCache[query] = action.payload.results
      break
    }
    case FETCH_AUTHOR_HEADERS: {
      draft.authorsHeaderCache = new ResourcePending()
      break
    }
    case CACHE_AUTHOR_HEADERS: {
      draft.authorsHeaderCache = action.payload.results
      break
    }
    case FETCH_SOURCE_CITATIONS: {
      draft.sourceHeaderCache = new ResourcePending()
      break
    }
    case CACHE_SOURCE_CITATIONS: {
      draft.sourceHeaderCache = action.payload.results
      break
    }
  }
})
