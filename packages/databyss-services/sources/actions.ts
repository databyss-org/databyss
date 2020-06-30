import * as sources from '.'
import { composeResults } from './_helpers'

import {
  FETCH_SOURCE,
  SAVE_SOURCE,
  CACHE_SOURCE,
  REMOVE_SOURCE,
  CACHE_SEARCH_QUERY,
  FETCH_SEARCH_QUERY,
} from './constants'
import { Source } from '../interfaces'

export function fetchSource(id: string) {
  return async (dispatch: Function) => {
    dispatch({
      type: FETCH_SOURCE,
      payload: {},
    })

    try {
      const source: Source = await sources.getSource(id)
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
    sources.setSource(sourceFields).then(() => {
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
      const results = await sources.searchSource(query)
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
