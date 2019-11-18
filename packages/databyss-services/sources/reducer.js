import { CACHE_SOURCE, REMOVE_SOURCE } from './constants'

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
