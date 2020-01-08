import _ from 'lodash'
import cloneDeep from 'clone-deep'

import {
  LOAD_PAGE,
  PAGE_LOADED,
  FETCHING_PAGES,
  PAGES_LOADED,
  CACHE_PAGE,
} from './constants'

export const initialState = {
  isLoading: false,
  cache: {},
  headerCache: {},
}

export default (state, action) => {
  switch (action.type) {
    case LOAD_PAGE: {
      return {
        ...state,
        isLoading: true,
      }
    }
    case PAGE_LOADED: {
      const _page = action.payload.page
      const _cache = state.cache
      _cache[action.payload.id] = _page
      return {
        ...state,
        isLoading: false,
        cache: _cache,
      }
    }
    case FETCHING_PAGES: {
      return {
        ...state,
        isLoading: true,
      }
    }
    case CACHE_PAGE: {
      const _state = cloneDeep(state)
      _state.cache[action.payload.id] = action.payload.body
      return {
        ..._state,
      }
    }

    case PAGES_LOADED: {
      const _cache = state.headerCache
      if (_.isArray(action.payload)) {
        action.payload.forEach(
          page =>
            (_cache[page._id] = {
              name: page.name,
              _id: page._id,
            })
        )
      }
      return {
        ...state,
        isLoading: false,
        headerCache: _cache,
      }
    }
    default:
      return state
  }
}
