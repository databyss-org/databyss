import produce, { Draft } from 'immer'
import {
  CACHE_SOURCE,
  REMOVE_SOURCE,
  CACHE_SEARCH_QUERY,
  FETCH_SEARCH_QUERY,
  FETCH_AUTHOR_HEADERS,
  CACHE_AUTHOR_HEADERS,
  FETCH_SOURCE_CITATIONS,
  CACHE_SOURCE_CITATIONS,
} from './constants'
import {
  FSA,
  SourceState,
  SourceCitationHeader,
  CacheDict,
  Author,
} from '../interfaces'
import { ResourcePending } from '../interfaces/ResourcePending'
import { resourceIsReady, getAuthorsFromSources } from '../lib/util'

export const initialState: SourceState = {
  cache: {},
  searchCache: {},
  authorsHeaderCache: null,
  citationHeaderCache: null,
}

export default produce((draft: Draft<SourceState>, action: FSA) => {
  let _citationHeaderCache: CacheDict<SourceCitationHeader> = {}

  if (resourceIsReady(draft.citationHeaderCache)) {
    _citationHeaderCache = draft.citationHeaderCache as CacheDict<
      SourceCitationHeader
    >
  }

  switch (action.type) {
    case CACHE_SOURCE: {
      const _source = action.payload.source
      draft.cache[action.payload.id] = _source
      if (resourceIsReady(_source)) {
        _citationHeaderCache[_source._id] = _source
        draft.citationHeaderCache = _citationHeaderCache
        // only populate header if header has been loaded
        if (draft.authorsHeaderCache){
          draft.authorsHeaderCache = getAuthorsFromSources(
            Object.values(_citationHeaderCache)
          )
        }
      }

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
      draft.authorsHeaderCache = action.payload.results.reduce(
        (dict: CacheDict<Author>, author: Author) => {
          dict[
            `${author.firstName?.textValue || ''}${author.lastName?.textValue ||
              ''}`
          ] = author
          return dict
        },
        {}
      )
      break
    }
    case FETCH_SOURCE_CITATIONS: {
      draft.citationHeaderCache = new ResourcePending()
      break
    }
    case CACHE_SOURCE_CITATIONS: {
      action.payload.results.forEach((source: SourceCitationHeader) => {
        _citationHeaderCache[source._id] = source
      })
      draft.citationHeaderCache = _citationHeaderCache
      break
    }
  }
})
