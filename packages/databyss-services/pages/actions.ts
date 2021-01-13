import { Page } from '@databyss-org/data/database/pages/util'
import * as services from '.'
import { ResourcePending } from '../interfaces/ResourcePending'
import { PatchBatch, PageHeader } from '../interfaces'

import {
  PATCH,
  FETCH_PAGE,
  CACHE_PAGE,
  CACHE_PAGE_HEADERS,
  FETCH_PAGE_HEADERS,
  DELETE_PAGE,
  ARCHIVE_PAGE,
  QUEUE_PATCH,
  REMOVE_PAGE_FROM_CACHE,
  SET_PAGE_PUBLIC,
  CACHE_PUBLIC_PAGE,
} from './constants'

export function fetchPage(_id: string) {
  return async (dispatch: Function) => {
    dispatch({
      type: FETCH_PAGE,
      payload: { id: _id },
    })
    try {
      const page = await services.loadPage(_id)
      dispatch({
        type: CACHE_PAGE,
        payload: { page, id: _id },
      })
    } catch (e) {
      dispatch({
        type: CACHE_PAGE,
        payload: { page: e, id: _id },
      })
      throw e
    }
  }
}

export function fetchPageHeaders() {
  return async (dispatch: Function) => {
    dispatch({
      type: FETCH_PAGE_HEADERS,
    })
    try {
      const pages = await services.getAllPages()

      dispatch({
        type: CACHE_PAGE_HEADERS,
        payload: pages,
      })
    } catch (e) {
      dispatch({
        type: CACHE_PAGE_HEADERS,
        payload: e,
      })
      throw e
    }
  }
}

const queue: PatchBatch[] = []
let timeoutId: any

let busy = false

// a PatchBatch is a list of patches that all apply to the same resource (Page)
export function savePatchBatch(batch?: PatchBatch) {
  // if patch is sent, add to queue
  if (batch) {
    queue.push(batch)
  }
  // if server has not completed previous request bail action
  if (busy) {
    return (dispatch: Function) => {
      dispatch({
        type: QUEUE_PATCH,
        payload: {
          queueSize: queue.length,
        },
      })
    }
  }

  if (!queue.length) {
    return (dispatch: Function) => {
      dispatch({
        type: PATCH,
        payload: {
          queueSize: 0,
        },
      })
    }
  }
  // perform first batch of patches in queue
  busy = true
  let _batch = queue.shift()
  let _patches = _batch!.patches
  const _pageId = _batch!.id
  while (queue.length) {
    _batch = queue.shift()
    if (_batch?.id !== _pageId) {
      queue.unshift(_batch!)
      break
    }
    _patches = _patches!.concat(_batch!.patches)
  }
  const _batchPatch = { id: _pageId, patches: _patches }
  return async (dispatch: Function) => {
    dispatch({
      type: QUEUE_PATCH,
      payload: {
        queueSize: 1,
      },
    })
    try {
      await services.savePatchBatch(_batchPatch)
      busy = false
      // repeat function with no patch variable if patches are still in queue
      dispatch({
        type: PATCH,
        payload: {
          queueSize: queue.length,
        },
      })
      if (queue.length) {
        dispatch(savePatchBatch())
      }
    } catch (err) {
      console.log(err)
      // if error set the patch back to the queue
      busy = false
      queue.unshift(_batchPatch)

      if (timeoutId) {
        clearTimeout(timeoutId)
      }

      // TODO: CHANGE TIMEOUT TO ENV VARIABLE
      timeoutId = setTimeout(() => dispatch(savePatchBatch()), 3000)

      dispatch({
        type: QUEUE_PATCH,
        payload: {
          queueSize: queue.length,
        },
      })

      throw err
    }
  }
}

export function savePageHeader(page: PageHeader) {
  const id = page._id

  return (dispatch: Function) => {
    dispatch({
      type: CACHE_PAGE,
      payload: { id, page },
    })
    services.savePageHeader(page)
  }
}

export function savePage(page: Page) {
  const id = page._id

  return (dispatch: Function) => {
    dispatch({
      type: CACHE_PAGE,
      payload: { page: new ResourcePending(), id },
    })

    services.savePage(page).then(() => {
      dispatch({
        type: CACHE_PAGE,
        payload: { page, id },
      })
    })
  }
}

export function removePageFromCache(id: string) {
  return {
    type: REMOVE_PAGE_FROM_CACHE,
    payload: { id },
  }
}

export function deletePage(id: string) {
  return async (dispatch: Function) => {
    dispatch({
      type: DELETE_PAGE,
      payload: { id },
    })
    await services.deletePage(id)
    dispatch(fetchPageHeaders())
  }
}

export function onArchivePage(
  id: string,
  page: Page,
  bool: boolean,
  callback: Function
) {
  return async (dispatch: Function) => {
    dispatch({
      type: ARCHIVE_PAGE,
      payload: { id },
    })
    const _page = { ...page, archive: bool }
    await services.savePageHeader({
      _id: page._id,
      name: page.name,
      archive: bool,
    })
    if (callback) {
      callback()
    }
    dispatch({
      type: CACHE_PAGE,
      payload: { id, page: _page },
    })
  }
}

export function setPagePublic(id: string, boolean: boolean, accountId: string) {
  return async (dispatch: Function) => {
    dispatch({
      type: SET_PAGE_PUBLIC,
      payload: { id, isPublic: boolean },
    })

    const _res = await services.setPagePublic(id, boolean, accountId)

    dispatch({
      type: CACHE_PUBLIC_PAGE,
      payload: { id, accountId: _res.accountId },
    })
  }
}
