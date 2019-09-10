import {
  SET_ACTIVE_BLOCK_ID,
  SET_ACTIVE_BLOCK_CONTENT,
  SET_EDITABLE_STATE,
  SET_ACTIVE_BLOCK_TYPE,
  INSERT_NEW_ACTIVE_BLOCK,
  SET_BLOCK_TYPE,
  BACKSPACE,
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

export function setActiveBlockType(type, editableState) {
  return {
    type: SET_ACTIVE_BLOCK_TYPE,
    payload: {
      type,
      editableState,
    },
  }
}

export function setBlockType(type, id, editableState, fromSymbolInput) {
  return {
    type: SET_BLOCK_TYPE,
    payload: {
      type,
      editableState,
      id,
      fromSymbolInput,
    },
  }
}

export function newActiveBlock(blockProperties, editableState) {
  return {
    type: INSERT_NEW_ACTIVE_BLOCK,
    payload: {
      editableState,
      blockProperties,
    },
  }
}

export function backspace(blockProperties, editableState) {
  return {
    type: BACKSPACE,
    payload: {
      editableState,
      blockProperties,
    },
  }
}
