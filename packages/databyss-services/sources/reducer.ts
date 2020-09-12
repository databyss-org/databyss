import produce, { Draft } from 'immer'
import {
  CACHE_SOURCE,
  REMOVE_SOURCE,
  FETCH_AUTHOR_HEADERS,
  CACHE_AUTHOR_HEADERS,
  FETCH_SOURCE_CITATIONS,
  CACHE_SOURCE_CITATIONS,
  REMOVE_PAGE_FROM_HEADERS,
  ADD_PAGE_TO_HEADER
} from './constants'
import {
  FSA,
  SourceState,
  SourceCitationHeader,
  CacheDict,
  Author,
} from '../interfaces'
import { ResourcePending } from '../interfaces/ResourcePending'
import { resourceIsReady, getAuthorsFromSources } from '../lib/util'

export const initialState: SourceState = {
  cache: {},
  authorsHeaderCache: null,
  citationHeaderCache: null,
}

export default produce((draft: Draft<SourceState>, action: FSA) => {
  let _citationHeaderCache: CacheDict<SourceCitationHeader> = {}

  if (resourceIsReady(draft.citationHeaderCache)) {
    _citationHeaderCache = draft.citationHeaderCache as CacheDict<
      SourceCitationHeader
    >
  }

  switch (action.type) {
    case CACHE_SOURCE: {
      const _source = { ...action.payload.source, type: 'SOURCE' }
      draft.cache[action.payload.id] = _source
      if (resourceIsReady(_source)) {
        _citationHeaderCache[_source._id] = _source
        draft.citationHeaderCache = _citationHeaderCache
        // only populate header if header has been loaded
        if (draft.authorsHeaderCache){
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
            `${author.firstName?.textValue || ''}${author.lastName?.textValue ||
              ''}`
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
      const _inPages = _citationHeaderCache[action.payload.id]?.isInPages
      if(_inPages){
        const _index = _inPages.findIndex(p=> p === action.payload.pageId)
        if(_index>-1){
          _citationHeaderCache[action.payload.id]?.isInPages.splice(_index, 1)
         draft.authorsHeaderCache = getAuthorsFromSources(
              Object.values(_citationHeaderCache)
            )
        }
      }
    
      break
    }
    case ADD_PAGE_TO_HEADER: {
      if(_citationHeaderCache){
        const _inPages = _citationHeaderCache[action.payload.id]?.isInPages
        if(_inPages){
          const _index = _inPages.findIndex(p=> p === action.payload.pageId)
          if(_index<0){
            _citationHeaderCache[action.payload.id].isInPages.push(action.payload.pageId)
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
  }
})
