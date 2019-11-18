import * as sources from './'
import { SourceNotFoundError } from './SourceNotFoundError'

import {
  FETCH_SOURCE,
  SAVE_SOURCE,
  CACHE_SOURCE,
  REMOVE_SOURCE,
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
      payload: {},
    })

    sources
      .setSource(sourceFields)
      .then(source => {
        dispatch({
          type: CACHE_SOURCE,
          payload: { source, id: sourceFields._id },
        })
      })
      .catch(() => {
        dispatch({
          type: CACHE_SOURCE,
          payload: {
            source: new SourceNotFoundError(
              'Source not saved',
              sourceFields._id
            ),
            id: sourceFields._id,
          },
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
