import cloneDeep from 'clone-deep'
import { ResourcePending } from './../lib/ResourcePending'

import {
  FETCH_PAGE,
  CACHE_PAGE,
  CACHE_PAGE_HEADERS,
  FETCH_PAGE_HEADERS,
  DELETE_PAGE,
  ARCHIVE_PAGE,
  PATCH,
  QUEUE_PATCH,
  REMOVE_PAGE_FROM_CACHE,
} from './constants'

export const initialState = {
  isLoading: false,
  cache: {},
  headerCache: null,
  refDict: {},
  patchQueueSize: 0,
}

export default (state, action) => {
  switch (action.type) {
    case PATCH:
    case QUEUE_PATCH: {
      return {
        ...state,
        patchQueueSize: action.payload.queueSize,
      }
    }
    case FETCH_PAGE: {
      const _state = cloneDeep(state)
      _state.cache[action.payload.id] = new ResourcePending()
      return {
        ..._state,
      }
    }
    case REMOVE_PAGE_FROM_CACHE: {
      const _cache = cloneDeep(state.cache)
      delete _cache[action.payload.id]

      return {
        cache: _cache,
        ...state,
      }
    }
    case CACHE_PAGE: {
      const _state = cloneDeep(state)
      const _pageState = action.payload.body

      _state.cache[action.payload.id] = _pageState
      // update header cache as well
      if (_state.headerCache && _pageState.page._id) {
        _state.headerCache[_pageState.page._id] = _pageState.page
      }
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

    case DELETE_PAGE: {
      const _cache = state.cache
      if (_cache[action.payload.id]) {
        delete _cache[action.payload.id]
      }

      const _headerCache = state.headerCache
      if (_headerCache[action.payload.id]) {
        delete _headerCache[action.payload.id]
      }

      return {
        ...state,
        cache: _cache,
        headerCache: _headerCache,
      }
    }

    case ARCHIVE_PAGE: {
      const _cache = state.cache
      if (_cache[action.payload.id]) {
        _cache[action.payload.id] = action.payload.page
      }
      const _headerCache = state.headerCache
      if (_headerCache[action.payload.id]) {
        delete _headerCache[action.payload.id]
      }
      return {
        ...state,
        cache: _cache,
        headerCache: _headerCache,
      }
    }

    case CACHE_PAGE_HEADERS: {
      const _cache = {}
      // filter archived pages
      action.payload.filter(p => !p.archive).forEach(
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
