import { SHOW_MODAL, DISMISS_MODAL } from './constants'

export const initialState = {
  modals: [],
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
    default:
      return state
  }
}
