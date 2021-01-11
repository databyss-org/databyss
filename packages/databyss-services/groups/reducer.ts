import produce, { Draft } from 'immer'
import {
  FSA,
  GroupState,
  Group,
  CacheDict,
  ResourcePending,
  GroupHeader,
} from '../interfaces'
import { FETCH_GROUP_HEADERS, CACHE_GROUP_HEADERS } from './constants'

export default produce((draft: Draft<GroupState>, action: FSA) => {
  switch (action.type) {
    case FETCH_GROUP_HEADERS: {
      draft.headerCache = new ResourcePending()
      break
    }
    case CACHE_GROUP_HEADERS: {
      if (action.payload.groups instanceof Error) {
        draft.headerCache = action.payload.groups
        break
      }
      draft.headerCache = action.payload.groups.reduce(
        (_cache: CacheDict<Group>, group: GroupHeader) => {
          _cache[group._id] = group
          return _cache
        },
        {}
      )
      break
    }
  }
})
