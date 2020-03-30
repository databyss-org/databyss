import {
  SHOW_MODAL,
  DISMISS_MODAL,
  NAVIGATE,
  NAVIGATE_SIDEBAR,
} from './constants'

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

export function navigateSidebar(path) {
  return {
    type: NAVIGATE_SIDEBAR,
    payload: { path },
  }
}
