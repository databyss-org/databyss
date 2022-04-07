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
  DELETE_PAGE,
  ARCHIVE_PAGE,
  REMOVE_PAGE_FROM_CACHE,
  PATCH,
  SET_PAGE_PUBLIC,
  CACHE_PUBLIC_PAGE,
  CACHE_SHARED_WITH_GROUPS,
  SET_FOCUS_INDEX,
} from './constants'
import { resourceIsReady } from '../lib/util'

export const initialState: PageState = {
  cache: {},
  headerCache: null,
  refDict: {},
  promiseDict: {},
  sharedWithGroups: [],
  focusIndex: null,
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
    case FETCH_PAGE: {
      draft.cache[action.payload.id] = new ResourcePending()
      draft.promiseDict[action.payload.id] = action.payload.promise
      break
    }
    case REMOVE_PAGE_FROM_CACHE: {
      delete draft.cache[action.payload.id]
      draft.promiseDict[action.payload.id]?.cancel()
      delete draft.promiseDict[action.payload.id]
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
        // update name in page cache
        if (_cache[_page._id]) {
          const __cache: any = _cache[_page._id]
          __cache.name = _page.name
        }
      }

      delete draft.promiseDict[action.payload.id]
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

    case SET_PAGE_PUBLIC: {
      if (draft.cache[action.payload.id]) {
        const _resource: any = draft.cache[action.payload.id]
        _resource.publicAccountId = new ResourcePending()
      }

      break
    }
    // TODO: SET_PUBLIC_PAGE IS SETTING publicAccountId TO RESOURCE PENDING AND place that in a loader
    case CACHE_PUBLIC_PAGE: {
      if (draft.cache[action.payload.id]) {
        const _resource: any = draft.cache[action.payload.id]
        _resource.publicAccountId = action.payload.accountId
      }
      break
    }
    case CACHE_SHARED_WITH_GROUPS: {
      draft.sharedWithGroups = action.payload.sharedWithGroups
      break
    }
    case SET_FOCUS_INDEX: {
      draft.focusIndex = action.payload
      break
    }
  }
})
