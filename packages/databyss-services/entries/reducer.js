import {
  SEARCH_ENTRY,
  CACHE_ENTRY_RESULTS,
  SET_QUERY,
  CLEAR_CACHE,
  FETCH_BLOCK_RELATIONS,
  CACHE_BLOCK_RELATIONS,
  CLEAR_BLOCK_RELATIONS_CACHE,
  SET_PAGE_QUERY,
} from './constants'
import { ResourcePending } from '../interfaces/ResourcePending'

export const initialState = {
  searchCache: {},
  searchTerm: '',
  pageSearchTerm: '',
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
    case SET_PAGE_QUERY: {
      return {
        ...state,
        pageSearchTerm: action.payload.textValue,
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
    case FETCH_BLOCK_RELATIONS: {
      const _cache = state.blockRelationsSearchCache
      _cache[action.payload] = new ResourcePending()
      return {
        ...state,
        blockRelationsSearchCache: _cache,
      }
    }
    case CACHE_BLOCK_RELATIONS: {
      const _cache = state.blockRelationsSearchCache
      _cache[action.payload.queryId] = action.payload.results
      return {
        ...state,
        blockRelationsSearchCache: _cache,
      }
    }
    default:
      return state
  }
}
