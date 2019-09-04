import * as services from '@databyss-org/services/pages'

import {
  SET_ACTIVE_BLOCK_ID,
  SET_ACTIVE_BLOCK_CONTENT,
  SET_EDITABLE_STATE,
  SET_ACTIVE_BLOCK_TYPE,
  LOAD_PAGE,
  SAVE_PAGE,
  PAGE_SAVED,
} from './constants'

export function setActiveBlockId(id, editableState) {
  return {
    type: SET_ACTIVE_BLOCK_ID,
    payload: {
      id,
      editableState,
    },
  }
}

export function setActiveBlockContent(html, editableState) {
  return {
    type: SET_ACTIVE_BLOCK_CONTENT,
    payload: {
      html,
      editableState,
    },
  }
}

export function setEditableState(editableState) {
  return {
    type: SET_EDITABLE_STATE,
    payload: {
      editableState,
    },
  }
}

export function setActiveBlockType(type, editableState, fromSymbolInput) {
  return {
    type: SET_ACTIVE_BLOCK_TYPE,
    payload: {
      type,
      editableState,
      fromSymbolInput,
    },
  }
}

export function loadPage() {
  return {
    type: LOAD_PAGE,
    payload: {},
  }
}

export function savePage(state) {
  return dispatch => {
    dispatch({
      type: SAVE_PAGE,
      payload: { editableState: state.editableState },
    })

    services.savePage(state).then(() => {
      dispatch(pageSaved())
    })
  }
}

export function pageSaved() {
  return {
    type: PAGE_SAVED,
    payload: {},
  }
}
