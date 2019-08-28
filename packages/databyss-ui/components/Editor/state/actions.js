import {
  SET_ACTIVE_BLOCK_ID,
  SET_ACTIVE_BLOCK_CONTENT,
  SET_DRAFT_STATE,
  SET_ACTIVE_BLOCK_TYPE,
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

export function setDraftState(editableState) {
  return {
    type: SET_DRAFT_STATE,
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
