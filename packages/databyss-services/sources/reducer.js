import { CACHE_SOURCE, ERROR } from './constants'

export const initialState = {
  cache: {},
}

export default (state, action) => {
  switch (action.type) {
    case CACHE_SOURCE: {
      const _cache = state.cache
      _cache[action.payload.source._id] = action.payload.source
      return {
        ...state,
        cache: _cache,
      }
    }
    case ERROR: {
      const _cache = state.cache
      _cache[action.payload.id] = action.payload.source
      return {
        ...state,
        cache: _cache,
      }
    }
    default:
      return state
  }
}
