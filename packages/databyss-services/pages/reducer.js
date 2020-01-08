import _ from 'lodash'
import cloneDeep from 'clone-deep'

import {
  LOAD_PAGE,
  SAVE_PAGE,
  PAGE_SAVED,
  PAGE_LOADED,
  SEED_PAGE,
  FETCHING_PAGES,
  PAGES_LOADED,
  CACHE_PAGE,
} from './constants'

export const initialState = {
  isLoading: false,
  isPagesLoading: false,
  isSaving: false,
  pages: null,
  pageState: {},
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
    case SAVE_PAGE: {
      return {
        ...state,
        isSaving: true,
      }
    }
    case SEED_PAGE: {
      return {
        ...state,
        isLoading: true,
      }
    }
    case PAGE_SAVED: {
      return {
        ...state,
        isSaving: false,
      }
    }
    case PAGE_LOADED: {
      const _page = action.payload.page
      const _cache = state.cache
      _cache[action.payload.id] = _page
      return {
        ...state,
        isLoading: false,
        // pageState: {
        //   ...action.payload.page,
        // },
        cache: _cache,
      }
    }
    case FETCHING_PAGES: {
      return {
        ...state,
        isLoading: true,
        isPagesLoading: true,
      }
    }
    case CACHE_PAGE: {
      const _state = cloneDeep(state)
      const _id = action.payload.page._id
      _state.cache[_id] = action.payload
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
        isPagesLoading: false,
        isLoading: false,
        pages: action.payload,
        headerCache: _cache,
      }
    }
    default:
      return state
  }
}
