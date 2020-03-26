import * as entries from './'

import { SEARCH_ENTRY, CACHE_RESULTS } from './constants'

export function onSearchEntries(string) {
  return async dispatch => {
    dispatch({
      type: SEARCH_ENTRY,
      payload: { query: string },
    })
    entries.searchEntries(string).then(res => {
      dispatch({
        type: CACHE_RESULTS,
        payload: { results: res, query: string },
      })
    })
  }
}
