import {
  SHOW_MODAL,
  DISMISS_MODAL,
  NAVIGATE_SIDEBAR,
  TOGGLE_MENU,
} from './constants'
import { ModalOptions } from './interfaces'

export function showModal(options: ModalOptions) {
  return {
    type: SHOW_MODAL,
    payload: options,
  }
}

export function hideModal() {
  return {
    type: DISMISS_MODAL,
  }
}

export function navigateSidebar(path: string) {
  return {
    type: NAVIGATE_SIDEBAR,
    payload: { path },
  }
}

export function menuOpen(isOpen: boolean) {
  return {
    type: TOGGLE_MENU,
    payload: { bool: isOpen },
  }
}
