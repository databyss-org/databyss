import * as entries from './'

import {
  SEARCH_ENTRY,
  CACHE_ENTRY_RESULTS,
  SET_QUERY,
  CLEAR_CACHE,
} from './constants'

export function onSearchEntries(string) {
  return async dispatch => {
    dispatch({
      type: SEARCH_ENTRY,
      payload: { query: string },
    })
    entries.searchEntries(string).then(res => {
      dispatch({
        type: CACHE_ENTRY_RESULTS,
        payload: { results: res, query: string },
      })
    })
  }
}

export function onSetQuery(query) {
  return dispatch => {
    dispatch({
      type: SET_QUERY,
      payload: query,
    })
  }
}

export function onClearCache() {
  return dispatch => {
    dispatch({
      type: CLEAR_CACHE,
    })
  }
}
