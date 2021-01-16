import produce, { Draft } from 'immer'
import {
  FSA,
  GroupState,
  CacheDict,
  ResourcePending,
  GroupHeader,
  PageHeader,
} from '../interfaces'
import {
  FETCH_GROUP_HEADERS,
  FETCH_SHARED_PAGE_HEADERS,
  CACHE_GROUP_HEADERS,
  CACHE_SHARED_PAGE_HEADERS,
  CACHE_GROUP,
} from './constants'

export default produce((draft: Draft<GroupState>, action: FSA) => {
  switch (action.type) {
    case FETCH_GROUP_HEADERS: {
      draft.headerCache = new ResourcePending()
      break
    }
    case FETCH_SHARED_PAGE_HEADERS: {
      draft.sharedPageHeaderCache = new ResourcePending()
      break
    }
    case CACHE_GROUP_HEADERS: {
      if (action.payload.groups instanceof Error) {
        draft.headerCache = action.payload.groups
        break
      }
      draft.headerCache = action.payload.groups.reduce(
        (_cache: CacheDict<GroupHeader>, group: GroupHeader) => {
          _cache[group._id] = group
          return _cache
        },
        {}
      )
      break
    }
    case CACHE_SHARED_PAGE_HEADERS: {
      if (action.payload.pageHeaders instanceof Error) {
        draft.sharedPageHeaderCache = action.payload.pageHeaders
        break
      }
      draft.sharedPageHeaderCache = action.payload.pageHeaders.reduce(
        (_cache: CacheDict<PageHeader>, page: PageHeader) => {
          _cache[page._id] = page
          return _cache
        },
        {}
      )
      break
    }
    case CACHE_GROUP: {
      draft.cache[action.payload.group._id] = action.payload.group
      const _headerCache = draft.headerCache as CacheDict<GroupHeader>
      _headerCache[action.payload.group._id] = {
        _id: action.payload.group._id,
        name: action.payload.group.name,
      }
      break
    }
  }
})
