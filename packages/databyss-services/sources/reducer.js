import {
  CACHE_SOURCE,
  SAVE_SOURCE,
  REMOVE_SOURCE,
  GET_ALL_SOURCES,
  CACHE_SOURCES,
  CACHE_SEARCH_QUERY,
} from './constants'

export const initialState = {
  cache: {},
  searchCache: {},
}

export default (state, action) => {
  switch (action.type) {
    case CACHE_SOURCE: {
      const _cache = state.cache
      _cache[action.payload.id] = action.payload.source
      return {
        ...state,
        cache: _cache,
      }
    }
    case CACHE_SOURCES: {
      const _sources = action.payload.sources
      const _cache = state.cache
      Object.keys(_sources).forEach(s => {
        _cache[s] = _sources[s]
      })
      return {
        ...state,
        cache: _cache,
      }
    }
    case SAVE_SOURCE: {
      const _cache = state.cache
      _cache[action.payload.id] = action.payload.source
      return {
        ...state,
        cache: _cache,
      }
    }
    case GET_ALL_SOURCES: {
      const _cache = state.cache
      action.payload.sources.forEach(s => {
        _cache[s._id] = s
      })
      return {
        ...state,
        cache: _cache,
      }
    }
    case REMOVE_SOURCE: {
      const _cache = state.cache
      if (_cache[action.payload.id]) {
        delete state.cache[action.payload.id]
      }
      return {
        ...state,
        cache: _cache,
      }
    }

    case CACHE_SEARCH_QUERY: {
      const _query = action.payload.query
      const _cache = state.searchCache
      _cache[_query] = action.payload.results

      return {
        ...state,
        searchCache: _cache,
      }
    }

    default:
      return state
  }
}
