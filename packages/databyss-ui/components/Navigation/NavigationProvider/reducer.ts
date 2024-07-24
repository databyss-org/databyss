import { produce, Draft } from 'immer'
import { FSA } from '@databyss-org/services/interfaces'
import { NavigationState } from './interfaces'
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

export default produce((draft: Draft<NavigationState>, action: FSA) => {
  switch (action.type) {
    case SHOW_MODAL: {
      draft.modals.push({
        visible: true,
        props: action.payload.props,
        component: action.payload.component,
      })
      break
    }
    case DISMISS_MODAL: {
      draft.modals.pop()
      break
    }
    case NAVIGATE_SIDEBAR: {
      draft.sidebarPath = action.payload.path
      break
    }
    case TOGGLE_MENU: {
      draft.menuOpen = action.payload.bool
      break
    }
  }
})
