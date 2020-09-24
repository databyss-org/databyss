import produce, { Draft } from 'immer'
import {
  ResourcePending,
  PageState,
  FSA,
  Page,
  PageHeader,
  CacheDict,
} from '../interfaces'

import {
  FETCH_PAGE,
  CACHE_PAGE,
  CACHE_PAGE_HEADERS,
  FETCH_PAGE_HEADERS,
  DELETE_PAGE,
  ARCHIVE_PAGE,
  QUEUE_PATCH,
  REMOVE_PAGE_FROM_CACHE,
  PATCH,
  SET_PAGE_PUBLIC,
  CACHE_PUBLIC_PAGE,
} from './constants'
import { resourceIsReady } from '../lib/util'

export const initialState: PageState = {
  cache: {},
  headerCache: null,
  refDict: {},
  patchQueueSize: 0,
}

export default produce((draft: Draft<PageState>, action: FSA) => {
  let _headerCache: CacheDict<PageHeader> = {}
  let _cache: CacheDict<Page> = {}

  if (resourceIsReady(draft.headerCache)) {
    _headerCache = draft.headerCache as CacheDict<PageHeader>
  }
  if (resourceIsReady(draft.cache)) {
    _cache = draft.cache as CacheDict<Page>
  }
  switch (action.type) {
    case PATCH:
    case QUEUE_PATCH: {
      draft.patchQueueSize = action.payload.queueSize
      break
    }
    case FETCH_PAGE: {
      draft.cache[action.payload.id] = new ResourcePending()
      break
    }
    case REMOVE_PAGE_FROM_CACHE: {
      delete draft.cache[action.payload.id]
      break
    }
    case CACHE_PAGE: {
      const _page = action.payload.page

      // cache the page if it is in pending/error state or if it has blocks (e.g. not a header)
      if (!resourceIsReady(_page) || _page.blocks) {
        draft.cache[action.payload.id] = _page
      }

      // update header cache as well
      if (resourceIsReady(_page)) {
        _headerCache[_page._id] = _page
        // update name in cache
        if (_cache[_page._id]) {
          _cache?[_page._id].name = _page.name
        }
      }
      break
    }
    case FETCH_PAGE_HEADERS: {
      draft.headerCache = new ResourcePending()
      break
    }

    case DELETE_PAGE: {
      delete draft.cache[action.payload.id]
      if (_headerCache) {
        delete _headerCache[action.payload.id]
      }
      break
    }
    case ARCHIVE_PAGE: {
      draft.cache[action.payload.id] = new ResourcePending()
      delete _headerCache[action.payload.id]

      break
    }

    case CACHE_PAGE_HEADERS: {
      if (action.payload instanceof Error) {
        break
      }

      action.payload.forEach((page: PageHeader) => {
        _headerCache[page._id] = {
          name: page.name,
          _id: page._id,
          archive: page.archive,
        }
      })
      draft.headerCache = _headerCache
      break
    }
    case SET_PAGE_PUBLIC: {
      draft.cache[action.payload.id].publicAccountId = new ResourcePending()
      break
    }
    // TODO: SET_PUBLIC_PAGE IS SETTING publicAccountId TO RESOURCE PENDING AND place that in a loader
    case CACHE_PUBLIC_PAGE: {
      draft.cache[action.payload.id].publicAccountId = action.payload.accountId

      break
    }
  }
})
