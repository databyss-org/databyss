import * as sources from './'
import { ResourceNotFoundError } from './../lib/ResourceNotFoundError'
import { NetworkUnavailableError } from './../lib/NetworkUnavailableError'

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
        let _err = new ResourceNotFoundError('Source not found')

        if (err.message === 'Failed to fetch') {
          _err = new NetworkUnavailableError('Network not available')
        }
        dispatch({
          type: CACHE_SOURCE,
          payload: {
            source: _err,
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
    sources
      .setSource(sourceFields)
      .then(source => {
        console.log(source)
        dispatch({
          type: CACHE_SOURCE,
          payload: { source: sourceFields, id: sourceFields._id },
        })
      })
      // check for type of error
      // send correct error class
      .catch(err => {
        let _err = new ResourceNotFoundError(
          'Source not saved',
          sourceFields._id
        )
        if (err.message === 'Failed to fetch') {
          _err = new NetworkUnavailableError('Network not available')
        }
        dispatch({
          type: CACHE_SOURCE,
          payload: {
            source: _err,
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
