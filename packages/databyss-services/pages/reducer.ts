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
} from './constants'

export const initialState: PageState = {
  cache: {},
  headerCache: null,
  refDict: {},
  patchQueueSize: 0,
}

export default produce((draft: Draft<PageState>, action: FSA) => {
  let _headerCache: CacheDict<PageHeader> = {}
  if (
    draft.headerCache &&
    !(draft.headerCache instanceof ResourcePending) &&
    !(draft.headerCache instanceof Error)
  ) {
    _headerCache = draft.headerCache as CacheDict<PageHeader>
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
      draft.cache[action.payload.id] = _page

      // update header cache as well
      if ((_page as PageHeader).name) {
        console.log('update header')
        _headerCache[(_page as PageHeader)._id] = _page
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
      ;(draft.cache[action.payload.id] as Page).archive = true
      delete _headerCache[action.payload.id]
      break
    }

    case CACHE_PAGE_HEADERS: {
      // filter archived pages
      action.payload.filter((p: PageHeader) => !p.archive).forEach(
        (page: PageHeader) =>
          (_headerCache[page._id] = {
            name: page.name,
            _id: page._id,
          })
      )
      draft.headerCache = _headerCache
    }
  }
})
