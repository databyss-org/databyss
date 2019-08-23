import {
  SET_ACTIVE_INDEX,
  MOVE_CARET_LEFT,
  MOVE_CARET_RIGHT,
  MOVE_CARET_UP,
  MOVE_CARET_DOWN,
  SELECT_TEXT,
  TEXT_CHANGE,
  DELETE_BLOCKS,
  INSERT_NEW_BLOCK,
  SELECT_BLOCKS,
  COPY_BLOCKS,
  PASTE_BLOCKS,
} from './constants'

export function setActiveIndex(index) {
  return {
    type: SET_ACTIVE_INDEX,
    payload: index,
  }
}

export function moveCaretLeft() {
  return {
    type: MOVE_CARET_LEFT,
  }
}

export function moveCaretRight() {
  return {
    type: MOVE_CARET_RIGHT,
  }
}

export function moveCaretUp() {
  return {
    type: MOVE_CARET_UP,
  }
}

export function moveCaretDown() {
  return {
    type: MOVE_CARET_DOWN,
  }
}

export function selectText(blockIndex, range) {
  return {
    type: SELECT_TEXT,
    payload: {
      blockIndex,
      range,
    },
  }
}

export function textChange(newText) {
  return {
    type: TEXT_CHANGE,
    payload: newText,
  }
}

export function deleteBlocks(blockRange) {
  return {
    type: DELETE_BLOCKS,
    payload: blockRange,
  }
}

export function insertNewBlock(beforeBlockIndex) {
  return {
    type: INSERT_NEW_BLOCK,
    payload: beforeBlockIndex,
  }
}

export function selectBlocks(blockRange) {
  return {
    type: SELECT_BLOCKS,
    payload: blockRange,
  }
}

export function copyBlocks(blockRange) {
  return {
    type: COPY_BLOCKS,
    payload: blockRange,
  }
}

export function pasteBlocks(blockRange) {
  return {
    type: PASTE_BLOCKS,
    payload: blockRange,
  }
}
