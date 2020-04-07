import cloneDeep from 'clone-deep'
import { ResourcePending } from './../lib/ResourcePending'

import {
  FETCH_PAGE,
  CACHE_PAGE,
  CACHE_PAGE_HEADERS,
  FETCH_PAGE_HEADERS,
  SET_PAGE_HEADER,
} from './constants'

export const initialState = {
  isLoading: false,
  cache: {},
  headerCache: null,
  refDict: {},
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
      const _statePage = _state.cache[action.payload.id]

      let _page = action.payload.body
      console.log(_page)

      // if only title is passed, preserve page content
      if (!_page.blocks) {
        _page = _statePage
        console.log('before', _page.page.name)
        _page.page.name = action.payload.body.page.name
        console.log('after', _page.page.name)

        console.log(action.payload.body.page.name)
        //   const _page
      }
      console.log(_page)

      _state.cache[action.payload.id] = _page
      if (_state.headerCache) {
        console.log('updates header')
        _state.headerCache[_page.page._id] = _page.page
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

    case SET_PAGE_HEADER: {
      const _headerCache = cloneDeep(state.headerCache)

      _headerCache[action.payload.id] = {
        name: action.payload.title,
        _id: action.payload.id,
      }
      return {
        ...state,
        headerCache: _headerCache,
      }
    }

    default:
      return state
  }
}
