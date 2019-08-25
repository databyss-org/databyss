import {
  SET_ACTIVE_BLOCK_ID,
  SET_ACTIVE_BLOCK_CONTENT,
  SET_EDITOR_STATE,
  SET_ACTIVE_BLOCK_TYPE,
} from './constants'

export function setActiveBlockId(id, editorState) {
  return {
    type: SET_ACTIVE_BLOCK_ID,
    payload: {
      id,
      editorState,
    },
  }
}

export function setActiveBlockContent(html, editorState) {
  return {
    type: SET_ACTIVE_BLOCK_CONTENT,
    payload: {
      html,
      editorState,
    },
  }
}

export function setEditorState(editorState) {
  return {
    type: SET_EDITOR_STATE,
    payload: {
      editorState,
    },
  }
}

export function setActiveBlockType(type) {
  return {
    type: SET_ACTIVE_BLOCK_TYPE,
    payload: {
      type,
    },
  }
}
