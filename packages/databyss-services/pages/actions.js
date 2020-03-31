import cloneDeep from 'clone-deep'
import * as services from './'

import {
  FETCH_PAGE,
  CACHE_PAGE,
  CACHE_PAGE_HEADERS,
  FETCH_PAGE_HEADERS,
} from './constants'

export function fetchPage(_id) {
  return dispatch => {
    dispatch({
      type: FETCH_PAGE,
      payload: { id: _id },
    })
    services
      .loadPage(_id)
      .then(res => {
        dispatch({
          type: CACHE_PAGE,
          payload: { body: res, id: _id },
        })
      })
      .catch(e => {
        dispatch({
          type: CACHE_PAGE,
          payload: { body: e, id: _id },
        })
      })
  }
}

export function fetchPageHeaders() {
  return dispatch => {
    dispatch({
      type: FETCH_PAGE_HEADERS,
    })
    services
      .getAllPages()
      .then(res => {
        dispatch({
          type: CACHE_PAGE_HEADERS,
          payload: res,
        })
      })
      .catch(e => {
        dispatch({
          type: CACHE_PAGE_HEADERS,
          payload: e,
        })
      })
  }
}

export function savePage(state) {
  const body = cloneDeep(state)
  delete body.editableState
  return dispatch => {
    dispatch({
      type: CACHE_PAGE,
      payload: { body, id: body.page._id },
    })
    services.savePage(body)
  }
}

export function seedPage(page, cache) {
  return dispatch => {
    services.savePage(page).then(() => {
      if (Object.keys(cache).length === 0 || !cache) {
        dispatch(fetchPageHeaders())
      }
    })
  }
}
