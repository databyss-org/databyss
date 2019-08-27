import {
  SET_ACTIVE_BLOCK_ID,
  SET_ACTIVE_BLOCK_CONTENT,
  SET_DRAFT_STATE,
  SET_ACTIVE_BLOCK_TYPE,
} from './constants'

export function setActiveBlockId(id, draftState) {
  return {
    type: SET_ACTIVE_BLOCK_ID,
    payload: {
      id,
      draftState,
    },
  }
}

export function setActiveBlockContent(html, draftState) {
  return {
    type: SET_ACTIVE_BLOCK_CONTENT,
    payload: {
      html,
      draftState,
    },
  }
}

export function setDraftState(draftState) {
  return {
    type: SET_DRAFT_STATE,
    payload: {
      draftState,
    },
  }
}

export function setActiveBlockType(type, draftState, fromSymbolInput) {
  return {
    type: SET_ACTIVE_BLOCK_TYPE,
    payload: {
      type,
      draftState,
      fromSymbolInput,
    },
  }
}
