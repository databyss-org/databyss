import {
  SEARCH_ENTRY,
  CACHE_ENTRY_RESULTS,
  SET_QUERY,
  CLEAR_CACHE,
  CLEAR_BLOCK_RELATIONS_CACHE,
} from './constants'
import { ResourcePending } from '../interfaces/ResourcePending'

export const initialState = {
  searchCache: {},
  searchTerm: '',
  blockRelationsSearchCache: {},
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
    case SET_QUERY: {
      return {
        ...state,
        searchTerm: action.payload.textValue,
      }
    }
    case CLEAR_CACHE: {
      return {
        ...state,
        searchCache: {},
      }
    }
    case CLEAR_BLOCK_RELATIONS_CACHE: {
      return {
        ...state,
        blockRelationsSearchCache: {},
      }
    }

    default:
      return state
  }
}
