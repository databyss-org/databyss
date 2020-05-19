import cloneDeep from 'clone-deep'
import * as services from './'
import { withWhitelist } from './_helpers'
import {
  PATCH,
  FETCH_PAGE,
  CACHE_PAGE,
  CACHE_PAGE_HEADERS,
  FETCH_PAGE_HEADERS,
  DELETE_PAGE,
  ARCHIVE_PAGE,
  SET_DEFAULT_PAGE,
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

export function savePatch(patch) {
  return dispatch => {
    dispatch({
      type: PATCH,
      //  payload: { body, id: body.page._id },
    })
    console.log(withWhitelist(patch))
    //  services.savePatch(patch)
  }
}

export function savePage(state) {
  const body = cloneDeep(state)
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

export function deletePage(id) {
  return dispatch => {
    dispatch({
      type: DELETE_PAGE,
      payload: { id },
    })
    services.deletePage(id).then(() => dispatch(fetchPageHeaders()))
  }
}

export function onArchivePage(id, page) {
  const _page = cloneDeep(page)
  _page.page.archive = true

  return dispatch => {
    dispatch({
      type: ARCHIVE_PAGE,
      payload: { id, page: _page },
    })
    services.savePage(_page)
  }
}

export function onSetDefaultPage(id) {
  services.setDefaultPage(id)

  return dispatch => {
    dispatch({
      type: SET_DEFAULT_PAGE,
    })
  }
}
