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
    case CACHE_PAGE: {
      const _state = cloneDeep(state)
      const _page = action.payload.body
      // if (!_page.page.name) {
      //   // preserve name
      //   const _name = _state.cache[action.payload.id].page.name
      //   _page.page.name = _name
      // }
      _state.cache[action.payload.id] = _page
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
