import {
  LOAD_PAGE,
  SAVE_PAGE,
  PAGE_SAVED,
  PAGE_LOADED,
  SEED_PAGE,
  FETCHING_PAGES,
  PAGES_LOADED,
} from './constants'

export const initialState = {
  isLoading: true,
  isPagesLoading: true,
  isSaving: false,
  pages: [],
}

export default (state, action) => {
  switch (action.type) {
    case LOAD_PAGE: {
      return {
        ...state,
        isLoading: true,
      }
    }
    case SAVE_PAGE: {
      return {
        ...state,
        isSaving: true,
      }
    }
    case SEED_PAGE: {
      return {
        ...state,
        isLoading: true,
      }
    }
    case PAGE_SAVED: {
      return {
        ...state,
        isSaving: false,
      }
    }
    case PAGE_LOADED: {
      return {
        ...state,
        isLoading: false,
        ...action.payload,
      }
    }
    case FETCHING_PAGES: {
      return {
        ...state,
        isPagesLoading: true,
      }
    }
    case PAGES_LOADED: {
      return {
        ...state,
        isPagesLoading: false,
        pages: action.payload,
      }
    }
    default:
      return state
  }
}
