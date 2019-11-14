import { CACHE_SOURCE } from './constants'

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
    default:
      return state
  }
}
