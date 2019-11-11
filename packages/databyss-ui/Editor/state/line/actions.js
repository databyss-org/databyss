import {
  SET_EDITABLE_STATE,
  SET_CONTENT,
  TOGGLE_MARK,
  HOTKEY,
} from './constants'

export function setContent(textValue, ranges, editableState) {
  return {
    type: SET_CONTENT,
    payload: {
      textValue,
      editableState,
      ranges,
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

export function toggleMark(mark, editableState) {
  return {
    type: TOGGLE_MARK,
    payload: {
      editableState,
      mark,
    },
  }
}

export function hotKey(command, editableState) {
  return {
    type: HOTKEY,
    payload: {
      editableState,
      command,
    },
  }
}
