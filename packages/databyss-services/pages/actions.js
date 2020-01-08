import cloneDeep from 'clone-deep'
import * as services from './'

import {
  LOAD_PAGE,
  PAGE_SAVED,
  FETCHING_PAGES,
  PAGES_LOADED,
  CACHE_PAGE,
} from './constants'

export function fetchPage(_id) {
  return dispatch => {
    dispatch({
      type: LOAD_PAGE,
      payload: {},
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

export function savePage(state) {
  console.log('save page', state)
  const body = cloneDeep(state)
  delete body.editableState
  return dispatch => {
    dispatch({
      type: CACHE_PAGE,
      payload: { body, id: body.page._id },
    })
    services.savePage(body).then(() => {
      dispatch({
        type: PAGE_SAVED,
        payload: {},
      })
      // TODO: PAGE_SAVED DOES NOTHING
      // HANDLE IF ERROR ON SAVING
    })
  }
}

export function fetchPages() {
  return dispatch => {
    dispatch({
      type: FETCHING_PAGES,
      payload: {},
    })
    services
      .getAllPages()
      .then(res => {
        dispatch({
          type: PAGES_LOADED,
          payload: res,
        })
      })
      .catch(e => {
        dispatch({
          type: PAGES_LOADED,
          payload: e,
        })
      })
  }
}

export function seedPage(page) {
  return dispatch => {
    services.savePage(page).then(() => {
      dispatch(fetchPages())
    })
  }
}
