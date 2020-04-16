import {
  SHOW_MODAL,
  DISMISS_MODAL,
  NAVIGATE_SIDEBAR,
  TOGGLE_MENU,
} from './constants'

export const initialState = {
  modals: [],
  menuOpen: true,
  sidebarPath: '/',
}

export default (state, action) => {
  switch (action.type) {
    case SHOW_MODAL: {
      return {
        ...state,
        modals: state.modals.concat({
          visible: true,
          props: action.payload.props,
          component: action.payload.component,
        }),
      }
    }
    case DISMISS_MODAL: {
      return {
        ...state,
        modals: state.modals.slice(0, -1),
      }
    }
    case NAVIGATE_SIDEBAR: {
      if (state.sidebarPath !== action.payload.path) {
        return {
          ...state,
          sidebarPath: action.payload.path,
        }
      }
      return state
    }
    case TOGGLE_MENU: {
      return {
        ...state,
        menuOpen: action.payload.bool,
      }
    }
    default:
      return state
  }
}
