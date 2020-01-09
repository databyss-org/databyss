import cloneDeep from 'clone-deep'
import { ResourcePending } from './../lib/ResourcePending'

import {
  FETCH_PAGE,
  CACHE_PAGE,
  CACHE_PAGE_HEADERS,
  FETCH_PAGE_HEADERS,
} from './constants'

export const initialState = {
  isLoading: false,
  cache: {},
  headerCache: null,
}

export default (state, action) => {
  switch (action.type) {
    case FETCH_PAGE: {
      const _state = cloneDeep(state)
      _state.cache[action.payload.id] = new ResourcePending()
      return {
        ..._state,
      }
    }
    // case PAGE_LOADED: {
    //   const _page = action.payload.page
    //   const _cache = state.cache
    //   _cache[action.payload.id] = _page
    //   return {
    //     ...state,
    //     isLoading: false,
    //     cache: _cache,
    //   }
    // }
    // case FETCHING_PAGES: {
    //   return {
    //     ...state,
    //     isLoading: true,
    //   }
    // }
    case CACHE_PAGE: {
      const _state = cloneDeep(state)
      _state.cache[action.payload.id] = action.payload.body
      return {
        ..._state,
      }
    }

    case FETCH_PAGE_HEADERS: {
      return {
        ...state,
        headerCache: new ResourcePending(),
      }
    }

    case CACHE_PAGE_HEADERS: {
      const _cache = {}
      action.payload.forEach(
        page =>
          (_cache[page._id] = {
            name: page.name,
            _id: page._id,
          })
      )
      return {
        ...state,
        headerCache: _cache,
      }
    }
    default:
      return state
  }
}
