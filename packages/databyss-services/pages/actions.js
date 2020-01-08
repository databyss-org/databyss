import cloneDeep from 'clone-deep'
import * as services from './'

import {
  LOAD_PAGE,
  SAVE_PAGE,
  PAGE_SAVED,
  PAGE_LOADED,
  SEED_PAGE,
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
          type: PAGE_LOADED,
          payload: { page: res, id: _id },
        })
      })
      .catch(e => {
        dispatch({
          type: PAGE_LOADED,
          payload: e,
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
      payload: body,
    })

    dispatch({
      type: SAVE_PAGE,
      payload: {},
    })
    // CACHE_PAGE HERE similar to autosave
    services.savePage(body).then(() => {
      dispatch({
        type: PAGE_SAVED,
        payload: {},
      })
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
    dispatch({
      type: SEED_PAGE,
      payload: {},
    })
    services.savePage(page).then(() => {
      dispatch(fetchPages())
    })
  }
}
