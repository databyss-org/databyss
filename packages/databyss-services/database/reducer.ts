import produce, { Draft } from 'immer'
import { FSA, DatabaseState } from '../interfaces'
import { ResourcePending } from '../interfaces/ResourcePending'
import { CREATE_DATABASE, CACHE_PAGE } from './constants'

export const initialState: DatabaseState = {
  db: null,
  pages: {},
}

export default (state: any, action: FSA) => {
  switch (action.type) {
    case CREATE_DATABASE: {
      return {
        ...state,
        db: action.payload.db,
      }
    }
    case CACHE_PAGE: {
      const _pages = state.pages
      _pages[action.payload.id] = action.payload.doc

      return {
        ...state,
        pages: _pages,
      }
    }

    default:
      return state
  }
}
