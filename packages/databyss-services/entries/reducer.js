import { SEARCH_ENTRY, CACHE_ENTRY_RESULTS } from './constants'
import { ResourcePending } from '../lib/ResourcePending'

export const initialState = {
  searchCache: {},
}

export default (state, action) => {
  switch (action.type) {
    case SEARCH_ENTRY: {
      const _cache = state.searchCache
      _cache[action.payload.query] = new ResourcePending()
      return {
        ...state,
        searchCache: _cache,
      }
    }
    case CACHE_ENTRY_RESULTS: {
      const _cache = state.searchCache
      _cache[action.payload.query] = action.payload.results
      return {
        ...state,
        searchCache: _cache,
      }
    }
    default:
      return state
  }
}
