import { SHOW_MODAL, DISMISS_MODAL } from './constants'

export function showModal({ component, props, dismiss }) {
  return {
    type: SHOW_MODAL,
    payload: {
      component,
      props,
      dismiss,
    },
  }
}

export function hideModal() {
  return {
    type: DISMISS_MODAL,
  }
}
