import { produce, Draft } from 'immer'
import { SEARCH_CATALOG, CACHE_SEARCH_RESULTS } from './constants'
import { FSA, CatalogState } from '../interfaces'
import { ResourcePending } from '../interfaces/ResourcePending'

export const initialState: CatalogState = {
  searchCache: {},
}

export default produce((draft: Draft<CatalogState>, action: FSA) => {
  switch (action.type) {
    case SEARCH_CATALOG: {
      const { query, type } = action.payload
      draft.searchCache[type] = draft.searchCache[type] || {}
      draft.searchCache[type][query] = new ResourcePending()
      break
    }
    case CACHE_SEARCH_RESULTS: {
      const { query, type } = action.payload
      draft.searchCache[type][query] = action.payload.results
      break
    }
  }
})
