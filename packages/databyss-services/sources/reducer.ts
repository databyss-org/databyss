import produce, { Draft } from 'immer'

import {
  Author,
  CacheDict,
  FSA,
  SourceCitationHeader,
  SourceState,
} from '../interfaces'
import { defaultCitationStyle } from '../citations/constants'
import { ResourcePending } from '../interfaces/ResourcePending'
import { resourceIsReady, getAuthorsFromSources } from '../lib/util'

import {
  ADD_PAGE_TO_HEADER,
  CACHE_AUTHOR_HEADERS,
  CACHE_SOURCE_CITATIONS,
  CACHE_SOURCE,
  FETCH_SOURCE,
  FETCH_AUTHOR_HEADERS,
  FETCH_SOURCE_CITATIONS,
  REMOVE_PAGE_FROM_HEADERS,
  REMOVE_SOURCE,
  SET_PREFERRED_CITATION_STYLE,
} from './constants'

export const initialState: SourceState = {
  cache: {},
  authorsHeaderCache: null,
  citationHeaderCache: null,
  preferredCitationStyle: defaultCitationStyle.id,
}

export default produce((draft: Draft<SourceState>, action: FSA) => {
  let _citationHeaderCache: CacheDict<SourceCitationHeader> = {}

  if (resourceIsReady(draft.citationHeaderCache)) {
    _citationHeaderCache = draft.citationHeaderCache as CacheDict<
      SourceCitationHeader
    >
  }

  switch (action.type) {
    case FETCH_SOURCE: {
      draft.cache[action.payload.id] = new ResourcePending()
      break
    }
    case CACHE_SOURCE: {
      let _source
      if (action.payload.source instanceof Error) {
        _source = action.payload.source
      } else {
        _source = { ...action.payload.source, type: 'SOURCE' }
      }
      draft.cache[action.payload.id] = _source
      if (resourceIsReady(_source)) {
        _citationHeaderCache[_source._id] = _source
        draft.citationHeaderCache = _citationHeaderCache
        // only populate header if header has been loaded
        if (draft.authorsHeaderCache) {
          draft.authorsHeaderCache = getAuthorsFromSources(
            Object.values(_citationHeaderCache)
          )
        }
      }

      break
    }

    case REMOVE_SOURCE: {
      delete draft.cache[action.payload.id]
      break
    }

    case FETCH_AUTHOR_HEADERS: {
      draft.authorsHeaderCache = new ResourcePending()
      break
    }

    case CACHE_AUTHOR_HEADERS: {
      draft.authorsHeaderCache = action.payload.results.reduce(
        (dict: CacheDict<Author>, author: Author) => {
          dict[
            `${author.firstName?.textValue || ''}${
              author.lastName?.textValue || ''
            }`
          ] = author
          return dict
        },
        {}
      )
      break
    }

    case FETCH_SOURCE_CITATIONS: {
      draft.citationHeaderCache = new ResourcePending()
      break
    }

    case REMOVE_PAGE_FROM_HEADERS: {
      const _resource: any = _citationHeaderCache[action.payload.id]

      const _inPages: string[] = _resource?.isInPages
      if (_inPages) {
        const _index = _inPages.findIndex((p) => p === action.payload.pageId)
        if (_index > -1) {
          _resource?.isInPages.splice(_index, 1)
          draft.authorsHeaderCache = getAuthorsFromSources(
            Object.values(_citationHeaderCache)
          )
        }
      }

      break
    }

    case ADD_PAGE_TO_HEADER: {
      if (_citationHeaderCache) {
        const _resource: any = _citationHeaderCache[action.payload.id]

        const _inPages: string[] = _resource?.isInPages
        if (_inPages) {
          const _index = _inPages.findIndex((p) => p === action.payload.pageId)
          if (_index < 0) {
            _resource.isInPages.push(action.payload.pageId)
            draft.authorsHeaderCache = getAuthorsFromSources(
              Object.values(_citationHeaderCache)
            )
          }
        }
      }
      break
    }

    case CACHE_SOURCE_CITATIONS: {
      action.payload.results.forEach((source: SourceCitationHeader) => {
        _citationHeaderCache[source._id] = source
      })
      draft.citationHeaderCache = _citationHeaderCache
      break
    }

    case SET_PREFERRED_CITATION_STYLE: {
      if (action.payload.styleId !== draft.preferredCitationStyle) {
        // save style because different than previous
        draft.preferredCitationStyle = action.payload.styleId
        // clear cache to ensure render is done in provider
        draft.citationHeaderCache = null
      }
      break
    }
  }
})
