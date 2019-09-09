import * as services from './'

import {
  LOAD_PAGE,
  SAVE_PAGE,
  PAGE_SAVED,
  PAGE_LOADED,
  SEED_PAGE,
  FETCHING_PAGES,
  PAGES_LOADED,
} from './constants'

export function loadPage(_id) {
  return dispatch => {
    dispatch({
      type: LOAD_PAGE,
      payload: {},
    })
    services.loadPage(_id).then(res => {
      dispatch({
        type: PAGE_LOADED,
        payload: res,
      })
    })
  }
}

export function savePage(state) {
  console.log('save page', state)
  const body = state
  delete body.editableState
  return dispatch => {
    dispatch({
      type: SAVE_PAGE,
      payload: {},
    })

    services.savePage(body).then(() => {
      dispatch({
        type: PAGE_SAVED,
        payload: {},
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

    services.savePage(page)
    // .then(res => {
    //   dispatch({
    //     type: PAGE_LOADED,
    //     payload: res,
    //   })
    // }
    // )
  }
}

export function getPages() {
  return dispatch => {
    dispatch({
      type: FETCHING_PAGES,
      payload: {},
    })

    services.getAllPages().then(res => {
      dispatch({
        type: PAGES_LOADED,
        payload: res,
      })
    })
  }
}
