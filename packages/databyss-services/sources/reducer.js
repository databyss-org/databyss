import {
  CACHE_SOURCE,
  SAVE_SOURCE,
  REMOVE_SOURCE,
  GET_ALL_SOURCES,
} from './constants'

export const initialState = {
  cache: {},
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
    default:
      return state
  }
}
