import produce, { Draft } from 'immer'
import { FSA, DatabaseState } from '../interfaces'
import { ResourcePending } from '../interfaces/ResourcePending'
// import {
//   FETCH_TOPIC,
//   CACHE_TOPIC,
//   FETCH_TOPIC_HEADERS,
//   CACHE_TOPIC_HEADERS,
//   REMOVE_PAGE_FROM_HEADER,
//   ADD_PAGE_TO_HEADER,
// } from './constants'

export const initialState: DatabaseState = {
  db: null,
}

export default (state: any, action: FSA) => {
  switch (action.type) {
    //   case CACHE_USER_ACCOUNT: {
    //     return {
    //       ...state,
    //       userInfo: action.payload.data,
    //     }
    //   }

    default:
      return state
  }
}
