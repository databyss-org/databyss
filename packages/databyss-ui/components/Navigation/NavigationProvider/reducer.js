import { SHOW_MODAL, DISMISS_MODAL, NAVIGATE } from './constants'

export const initialState = {
  modals: [],
  path: '/',
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
    case NAVIGATE: {
      return {
        ...state,
        path: action.payload.path,
      }
    }
    default:
      return state
  }
}
