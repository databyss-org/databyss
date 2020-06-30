import produce, { Draft } from 'immer'
import {
  CACHE_SOURCE,
  SAVE_SOURCE,
  REMOVE_SOURCE,
  CACHE_SOURCES,
  CACHE_SEARCH_QUERY,
  FETCH_SEARCH_QUERY,
} from './constants'
import { FSA, SourceState } from '../interfaces'
import { ResourcePending } from '../interfaces/ResourcePending'

export const initialState: SourceState = {
  cache: {},
  searchCache: {},
}

export default produce((draft: Draft<SourceState>, action: FSA) => {
  switch (action.type) {
    case CACHE_SOURCE: {
      draft.cache[action.payload.id] = action.payload.source
      break
    }
    case CACHE_SOURCES: {
      const { sources } = action.payload
      Object.keys(sources).forEach(s => {
        draft.cache[s] = sources[s]
      })
      break
    }
    case SAVE_SOURCE: {
      draft.cache[action.payload.id] = action.payload.source
      break
    }
    case REMOVE_SOURCE: {
      delete draft.cache[action.payload.id]
      break
    }
    case FETCH_SEARCH_QUERY: {
      const { query } = action.payload
      draft.cache[query] = new ResourcePending()
      break
    }
    case CACHE_SEARCH_QUERY: {
      const { query } = action.payload
      draft.cache[query] = action.payload.results
      break
    }
  }
})
