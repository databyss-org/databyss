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
    sources
      .getSource(id)
      .then(source => {
        dispatch({
          type: CACHE_SOURCE,
          payload: { source },
        })
      })
      .catch(() => {
        dispatch({
          type: ERROR,
          payload: {
            source: new SourceNotFoundError('Source not found', id),
            id,
          },
        })
      })
  }
}

export function saveSource(id) {
  return dispatch => {
    dispatch({
      type: SET_SOURCE,
      payload: {},
    })
    sources.setSource(id).then(source => {
      dispatch({
        type: CACHE_SOURCE,
        payload: { source },
      }).catch(() => {
        dispatch({
          type: ERROR,
          payload: {
            source: new SourceNotFoundError('Source not saved'),
            id,
          },
        })
      })
    })
  }
}

export function deleteSource(id) {
  return dispatch => {
    dispatch({
      type: DELETE_SOURCE,
      payload: {},
    })
    sources
      .deleteSource(id)
      .then(source => {
        dispatch({
          type: SOURCE_DELETED,
          payload: { source },
        })
      })
      .catch(() => {
        dispatch({
          type: ERROR,
          payload: {
            source: new SourceNotFoundError('Source not deleted'),
            id,
          },
        })
      })
  }
}
