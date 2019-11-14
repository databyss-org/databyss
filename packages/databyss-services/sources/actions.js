import * as sources from './'
import { SourceNotFoundError } from './SourceNotFoundError'

import { GET_SOURCE, SET_SOURCE, CACHE_SOURCE } from './constants'

export function fetchSource(id) {
  return async dispatch => {
    dispatch({
      type: GET_SOURCE,
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
      .catch(() => {
        dispatch({
          type: CACHE_SOURCE,
          payload: {
            source: new SourceNotFoundError('Source not found', id),
            id,
          },
        })
      })
  }
}

export function saveSource(sourceFields) {
  return async dispatch => {
    dispatch({
      type: SET_SOURCE,
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
