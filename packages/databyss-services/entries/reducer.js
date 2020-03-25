import { SEARCH_ENTRY, CACHE_RESULTS } from './constants'
import { ResourcePending } from '../lib/ResourcePending'

export const initialState = {
  searchResults: [],
  searchTerm: '',
}

export default (state, action) => {
  switch (action.type) {
    case SEARCH_ENTRY: {
      return {
        ...state,
        searchTerm: action.payload.query,
        searchResults: new ResourcePending(),
      }
    }
    case CACHE_RESULTS: {
      return {
        ...state,
        searchResults: action.payload.results,
      }
    }
    default:
      return state
  }
}
