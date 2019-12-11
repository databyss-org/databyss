import cloneDeep from 'clone-deep'
import { SHOW_MODAL, DISMISS_MODAL } from './constants'

export const initialState = {
  modals: [
    // {
    // 	visible: bool,
    // 	component: SourceModal,
    // 	props: {}
    // }
  ],
}

export default (state, action) => {
  switch (action.type) {
    case SHOW_MODAL: {
      const _state = cloneDeep(state)
      const _modals = _state.modals
      _modals.push({
        visible: true,
        props: action.payload.props,
        component: action.payload.component,
      })
      return {
        ...state,
        modals: _modals,
      }
    }
    case DISMISS_MODAL: {
      const _state = cloneDeep(state)
      const _modals = _state.modals
      _modals.pop()
      return {
        ...state,
        modals: _modals,
      }
    }
    default:
      return state
  }
}
