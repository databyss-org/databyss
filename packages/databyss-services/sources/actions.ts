import * as services from '.'
import {
  FETCH_SOURCE,
  SAVE_SOURCE,
  CACHE_SOURCE,
  REMOVE_SOURCE,
  FETCH_AUTHOR_HEADERS,
  CACHE_AUTHOR_HEADERS,
  FETCH_SOURCE_CITATIONS,
  CACHE_SOURCE_CITATIONS,
  REMOVE_PAGE_FROM_HEADERS,
  ADD_PAGE_TO_HEADER,
} from './constants'
import { Source, Author, SourceCitationHeader } from '../interfaces'

export function fetchSource(id: string) {
  return async (dispatch: Function) => {
    dispatch({
      type: FETCH_SOURCE,
      payload: {},
    })

    try {
      const source: Source = await services.getSource(id)
      dispatch({
        type: CACHE_SOURCE,
        payload: { source, id },
      })
    } catch (err) {
      dispatch({
        type: CACHE_SOURCE,
        payload: {
          source: err,
          id,
        },
      })
    }
  }
}

export function saveSource(sourceFields: Source) {
  return async (dispatch: Function) => {
    dispatch({
      type: SAVE_SOURCE,
      payload: { source: sourceFields, id: sourceFields._id },
    })
    services.setSource(sourceFields).then(() => {
      dispatch({
        type: CACHE_SOURCE,
        payload: { source: sourceFields, id: sourceFields._id },
      })
      // reset headers
      dispatch(fetchAuthorHeaders())
      dispatch(fetchSourceCitations())
    })
  }
}

export function removeSourceFromCache(id: string) {
  return (dispatch: Function) => {
    dispatch({
      type: REMOVE_SOURCE,
      payload: { id },
    })
  }
}

export function fetchAuthorHeaders() {
  return async (dispatch: Function) => {
    dispatch({
      type: FETCH_AUTHOR_HEADERS,
    })
    try {
      const authors: Author[] = await services.getAuthors()
      dispatch({
        type: CACHE_AUTHOR_HEADERS,
        payload: { results: authors },
      })
    } catch (err) {
      dispatch({
        type: CACHE_AUTHOR_HEADERS,
        payload: {
          err,
        },
      })
    }
  }
}

export function removePageFromHeaders(id: string, pageId: string) {
  return (dispatch: Function) => {
    dispatch({
      type: REMOVE_PAGE_FROM_HEADERS,
      payload: { id, pageId },
    })
  }
}

export function addPageToHeaders(id: string, pageId: string) {
  return (dispatch: Function) => {
    dispatch({
      type: ADD_PAGE_TO_HEADER,
      payload: { id, pageId },
    })
  }
}

export function fetchSourceCitations() {
  return async (dispatch: Function) => {
    dispatch({
      type: FETCH_SOURCE_CITATIONS,
    })
    try {
      const sourceCitations: SourceCitationHeader[] = await services.getSourceCitations()
      dispatch({
        type: CACHE_SOURCE_CITATIONS,
        payload: { results: sourceCitations },
      })
    } catch (err) {
      dispatch({
        type: CACHE_SOURCE_CITATIONS,
        payload: {
          err,
        },
      })
    }
  }
}
