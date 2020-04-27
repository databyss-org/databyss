import * as sources from './'
import { composeResults } from './_helpers'
import { ResourcePending } from '../lib/ResourcePending'

import {
  FETCH_SOURCE,
  SAVE_SOURCE,
  CACHE_SOURCE,
  REMOVE_SOURCE,
  GET_ALL_SOURCES,
  FETCH_PAGE_SOURCES,
  CACHE_SOURCES,
  FETCH_SOURCE_FROM_LIST,
  CACHE_SEARCH_QUERY,
} from './constants'

export function fetchSource(id) {
  return async dispatch => {
    dispatch({
      type: FETCH_SOURCE,
      payload: {},
    })

    sources
      .getSource(id)
      .then(source => {
        dispatch({
          type: CACHE_SOURCE,
          payload: { source, id },
        })
      })
      .catch(err => {
        dispatch({
          type: CACHE_SOURCE,
          payload: {
            source: err,
            id,
          },
        })
      })
  }
}

export function saveSource(sourceFields) {
  return async dispatch => {
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

export function removeSourceFromCache(id) {
  return dispatch => {
    dispatch({
      type: REMOVE_SOURCE,
      payload: { id },
    })
  }
}

export function fetchAllSources() {
  return async dispatch => {
    dispatch({
      type: FETCH_SOURCE,
      payload: {},
    })
    sources.getSources().then(sources => {
      dispatch({
        type: GET_ALL_SOURCES,
        payload: { sources },
      })
    })
  }
}

export function fetchPageSources(id) {
  return async dispatch => {
    dispatch({
      type: FETCH_PAGE_SOURCES,
      payload: {},
    })
    sources.getPageSources(id).then(sources => {
      dispatch({
        type: CACHE_SOURCES,
        payload: { sources },
      })
    })
  }
}

export function fetchSourcesFromList(list) {
  return async dispatch => {
    dispatch({
      type: FETCH_SOURCE_FROM_LIST,
      payload: {},
    })
    sources.getSourceFromList(list).then(sources => {
      dispatch({
        type: CACHE_SOURCES,
        payload: { sources },
      })
    })
  }
}

export function fetchSourceQuery(query) {
  return async dispatch => {
    dispatch({
      type: CACHE_SEARCH_QUERY,
      payload: {
        query,
        results: new ResourcePending(),
      },
    })
    sources.searchSource(query).then(results => {
      dispatch({
        type: CACHE_SEARCH_QUERY,
        payload: {
          query,
          results: composeResults(results, query),
        },
      })
    })
  }
}

// export function deleteSource(id) {
//   return async dispatch => {
//     dispatch({
//       type: DELETE_SOURCE,
//       payload: {},
//     })
// sources
//   .deleteSource(id)
//   .then(source => {
//     dispatch({
//       type: SOURCE_DELETED,
//       payload: { source },
//     })
//   })
//   .catch(() => {
//     dispatch({
//       type: ERROR,
//       payload: {
//         source: new SourceNotFoundError('Source not deleted'),
//         id,
//       },
//     })
//   })
//   }
// }
