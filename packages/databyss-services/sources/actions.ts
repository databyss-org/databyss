import * as services from '.'
import { composeResults } from './_helpers'
import {
  FETCH_SOURCE,
  SAVE_SOURCE,
  CACHE_SOURCE,
  REMOVE_SOURCE,
  CACHE_SEARCH_QUERY,
  FETCH_SEARCH_QUERY,
  FETCH_AUTHOR_HEADERS,
  CACHE_AUTHOR_HEADERS,
} from './constants'
import { Source, Author } from '../interfaces'

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

export function fetchSourceQuery(query: string) {
  return async (dispatch: Function) => {
    dispatch({
      type: FETCH_SEARCH_QUERY,
      payload: {
        query,
      },
    })
    try {
      const results = await services.searchSource(query)
      dispatch({
        type: CACHE_SEARCH_QUERY,
        payload: {
          query,
          results: composeResults(results, query),
        },
      })
    } catch {
      // if offline
      dispatch({
        type: CACHE_SEARCH_QUERY,
        payload: {
          query,
          results: [],
        },
      })
    }
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
