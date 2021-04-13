import * as services from '.'
import { ResourcePending } from '../interfaces/ResourcePending'
import { Page } from '../interfaces'
import { removeAllGroupsFromPage } from '../../databyss-data/pouchdb/groups/index'
import { PageDoc } from '../../databyss-data/pouchdb/interfaces'

import {
  FETCH_PAGE,
  CACHE_PAGE,
  DELETE_PAGE,
  ARCHIVE_PAGE,
  REMOVE_PAGE_FROM_CACHE,
  SET_PAGE_PUBLIC,
  CACHE_PUBLIC_PAGE,
  CACHE_SHARED_WITH_GROUPS,
} from './constants'

export function fetchPage(_id: string) {
  return async (dispatch: Function) => {
    const pPage = services.loadPage(_id)
    dispatch({
      type: FETCH_PAGE,
      payload: { id: _id, promise: pPage },
    })
    pPage
      .then((page) => {
        dispatch({
          type: CACHE_PAGE,
          payload: { page, id: _id },
        })
      })
      .catch((e) => {
        if (pPage.isCanceled) {
          // abort, do nothing
          return
        }
        dispatch({
          type: CACHE_PAGE,
          payload: { page: e, id: _id },
        })
        throw e
      })
  }
}

export function savePageHeader(page: Page) {
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
  }
}

export function onArchivePage(
  id: string,
  page: Page & PageDoc,
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

    removeAllGroupsFromPage(page._id)

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

export function cacheSharedWithGroups(sharedWithGroups: string[]) {
  return {
    type: CACHE_SHARED_WITH_GROUPS,
    payload: { sharedWithGroups },
  }
}
