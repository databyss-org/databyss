import { FETCH_TOPIC, SAVE_TOPIC, CACHE_TOPIC } from './constants'

export const initialState = {
  cache: {},
}

export default (state, action) => {
  switch (action.type) {
    case CACHE_TOPIC: {
      const _cache = state.cache
      _cache[action.payload.id] = action.payload.topic
      return {
        ...state,
        cache: _cache,
      }
    }
    case SAVE_TOPIC: {
      const _cache = state.cache
      _cache[action.payload.id] = action.payload.topic
      return {
        ...state,
        cache: _cache,
      }
    }

    default:
      return state
  }
}
