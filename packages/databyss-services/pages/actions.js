import cloneDeep from 'clone-deep'
import * as services from './'
import {
  PATCH,
  FETCH_PAGE,
  CACHE_PAGE,
  CACHE_PAGE_HEADERS,
  FETCH_PAGE_HEADERS,
  DELETE_PAGE,
  ARCHIVE_PAGE,
  SET_DEFAULT_PAGE,
  QUEUE_PATCH,
  REMOVE_PAGE_FROM_CACHE,
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

const queue = []
let timeoutId = null

let busy = false

export function savePatch(patch) {
  // if patch is sent, add to queue
  if (patch) {
    queue.push(patch)
  }
  // if server has not completed previous request bail action
  if (busy) {
    return dispatch => {
      dispatch({
        type: QUEUE_PATCH,
        payload: {
          queueSize: queue.length,
        },
      })
    }
  }
  // perform first batch of patches in queue
  busy = true
  let _patch = queue.shift()
  let _batch = _patch.patch
  const _pageId = _patch.id
  while (queue.length) {
    _patch = queue.shift()
    if (_patch.id !== _pageId) {
      queue.unshift(_patch)
      break
    }
    _batch = _batch.concat(_patch.patch)
  }
  const _batchPatch = { id: _pageId, patch: _batch }
  return dispatch => {
    services
      .savePatch(_batchPatch)
      .then(() => {
        busy = false
        // repeat function with no patch variable if patches are still in queue
        dispatch({
          type: PATCH,
          payload: {
            queueSize: queue.length,
          },
        })
        if (queue.length) {
          dispatch(savePatch())
        }
      })
      .catch(() => {
        // if error set the patch back to the queue
        busy = false
        queue.unshift(_batchPatch)

        if (timeoutId) {
          clearTimeout(timeoutId)
        }

        // TODO: CHANGE TIMEOUT TO ENV VARIABLE
        timeoutId = setTimeout(() => dispatch(savePatch()), 3000)

        dispatch({
          type: QUEUE_PATCH,
          payload: {
            queueSize: queue.length,
          },
        })
      })
  }
}

export function savePage(state) {
  const id = state.page._id
  const body = cloneDeep(state)

  return dispatch => {
    dispatch({
      type: CACHE_PAGE,
      payload: { body, id },
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

export function removePageIdFromCache(id) {
  return dispatch => {
    dispatch({
      type: REMOVE_PAGE_FROM_CACHE,
      payload: { id },
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
