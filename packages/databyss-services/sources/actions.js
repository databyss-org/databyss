import * as sources from './'
import SourceNotFoundError from './SourceNotFoundError'

import {
  GET_SOURCE,
  SET_SOURCE,
  DELETE_SOURCE,
  CACHE_SOURCE,
  SOURCE_DELETED,
  ERROR,
} from './constants'

export function fetchSource(id) {
  return async dispatch => {
    dispatch({
      type: GET_SOURCE,
      payload: {},
    })

    let source = await sources.getSource(id)
    if (!source) {
      source = new SourceNotFoundError('Source not found', id)
    }

    dispatch({
      type: CACHE_SOURCE,
      payload: { source, id },
    })
  }
}

export function saveSource(sourceFields) {
  return async dispatch => {
    dispatch({
      type: SET_SOURCE,
      payload: {},
    })

    let source = await sources.setSource(sourceFields)
    if (!source) {
      source = new SourceNotFoundError('Source not saved', id)
    }

    dispatch({
      type: CACHE_SOURCE,
      payload: { source, id: sourceFields._id },
    })
  }
}

// export function deleteSource(id) {
//   return dispatch => {
//     dispatch({
//       type: DELETE_SOURCE,
//       payload: {},
//     })

//     let source = await sources.deleteSource(id)
//     if (!source) {
//       source = new SourceNotFoundError('Source not deleted', id)
//     }

//     dispatch({
//       type: CACHE_SOURCE,
//       payload: { source, id },
//     })

//   }
// }
