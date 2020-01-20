import { SHOW_MODAL, DISMISS_MODAL, NAVIGATE } from './constants'

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

export function navigate(path) {
  return {
    type: NAVIGATE,
    payload: { path },
  }
}
