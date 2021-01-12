import { CacheDict, Group, ResourceResponse } from '../interfaces'
import {
  FETCH_GROUP_HEADERS,
  CACHE_GROUP_HEADERS,
  SAVE_GROUP,
} from './constants'
import * as services from './services'

export function fetchGroupHeaders() {
  return async (dispatch: Function) => {
    dispatch({
      type: FETCH_GROUP_HEADERS,
    })
    let response: ResourceResponse<CacheDict<Group>>
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

export function saveGroup(group: Group) {
  return (dispatch: Function) => {
    services.saveGroup(group)
    dispatch({
      type: SAVE_GROUP,
      payload: { group },
    })
  }
}
