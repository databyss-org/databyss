import {
  SAVE_TOPIC,
  CACHE_TOPIC,
  CLEAR_TOPICS,
  GET_ALL_TOPICS,
} from './constants'

export const initialState = {
  cache: {},
  isLoading: false,
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

    case CLEAR_TOPICS: {
      return {
        ...state,
        cache: {},
        isLoading: true,
      }
    }

    case GET_ALL_TOPICS: {
      const _cache = {}
      action.payload.topics.forEach(topic => {
        _cache[topic._id] = topic
      })
      return {
        ...state,
        isLoading: false,
        cache: _cache,
      }
    }

    default:
      return state
  }
}
