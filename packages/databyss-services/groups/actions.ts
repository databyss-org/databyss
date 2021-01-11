import { CacheDict, Group, ResourceResponse } from '../interfaces'
import { FETCH_GROUP_HEADERS, CACHE_GROUP_HEADERS } from './constants'
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
