import {
  CacheDict,
  Group,
  GroupHeader,
  PageHeader,
  ResourceResponse,
} from '../interfaces'
import {
  FETCH_GROUP_HEADERS,
  FETCH_SHARED_PAGE_HEADERS,
  CACHE_GROUP_HEADERS,
  CACHE_SHARED_PAGE_HEADERS,
  FETCH_GROUP,
  CACHE_GROUP,
} from './constants'
import * as services from './services'

export function fetchGroupHeaders() {
  return async (dispatch: Function) => {
    dispatch({
      type: FETCH_GROUP_HEADERS,
    })
    let response: ResourceResponse<CacheDict<GroupHeader>>
    try {
      response = await services.getGroupHeaders()
      dispatch({
        type: CACHE_GROUP_HEADERS,
        payload: { groups: response },
      })
    } catch (err) {
      response = err
    }

    if (response instanceof Error) {
      throw response
    }
  }
}
export function fetchSharedPageHeaders() {
  return async (dispatch: Function) => {
    dispatch({
      type: FETCH_SHARED_PAGE_HEADERS,
    })
    let response: ResourceResponse<CacheDict<PageHeader>>
    try {
      response = await services.getSharedPageHeaders()
      dispatch({
        type: CACHE_SHARED_PAGE_HEADERS,
        payload: { pageHeaders: response },
      })
    } catch (err) {
      response = err
    }

    if (response instanceof Error) {
      throw response
    }
  }
}

export function fetchGroup(id: string) {
  return async (dispatch: Function) => {
    dispatch({
      type: FETCH_GROUP,
    })
    let response: ResourceResponse<Group>
    try {
      response = await services.getGroup(id)
      dispatch({
        type: CACHE_GROUP,
        payload: { group: response },
      })
    } catch (err) {
      response = err
    }

    if (response instanceof Error) {
      throw response
    }
  }
}

export function saveGroup(group: Group) {
  return (dispatch: Function) => {
    services.saveGroup(group)
    dispatch({
      type: CACHE_GROUP,
      payload: { group },
    })
  }
}
