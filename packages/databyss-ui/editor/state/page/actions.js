import {
  SET_ACTIVE_BLOCK_ID,
  SET_ACTIVE_BLOCK_CONTENT,
  SET_EDITABLE_STATE,
  SET_ACTIVE_BLOCK_TYPE,
  INSERT_NEW_ACTIVE_BLOCK,
  SET_BLOCK_TYPE,
  BACKSPACE,
  TOGGLE_MARK,
  HOTKEY,
  CLEAR_BLOCK,
  START_TAG,
  DELETE_BLOCK,
  DELETE_BLOCKS,
  SHOW_MENU_ACTIONS,
  SHOW_FORMAT_MENU,
  SHOW_NEW_BLOCK_MENU,
  UPDATE_SOURCE,
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

export function setActiveBlockContent(html, editableState, ranges) {
  return {
    type: SET_ACTIVE_BLOCK_CONTENT,
    payload: {
      html,
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

export function setActiveBlockType(type, editableState) {
  return {
    type: SET_ACTIVE_BLOCK_TYPE,
    payload: {
      type,
      editableState,
    },
  }
}

export function setBlockType(type, id, editableState) {
  return {
    type: SET_BLOCK_TYPE,
    payload: {
      type,
      editableState,
      id,
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

export function clearBlock(id, editableState) {
  return {
    type: CLEAR_BLOCK,
    payload: {
      editableState,
      id,
    },
  }
}

export function startTag(tag, editableState) {
  return {
    type: START_TAG,
    payload: {
      tag,
      editableState,
    },
  }
}

export function onShowMenuActions(bool, editableState) {
  return {
    type: SHOW_MENU_ACTIONS,
    payload: {
      bool,
      editableState,
    },
  }
}

export function onShowFormatMenu(bool, editableState) {
  return {
    type: SHOW_FORMAT_MENU,
    payload: {
      bool,
      editableState,
    },
  }
}

export function deleteBlock(id, editableState) {
  return {
    type: DELETE_BLOCK,
    payload: {
      editableState,
      id,
    },
  }
}

export function deleteBlocks(idList, editableState) {
  return {
    type: DELETE_BLOCKS,
    payload: {
      editableState,
      idList,
    },
  }
}

export function newBlockMenu(bool, editableState) {
  return {
    type: SHOW_NEW_BLOCK_MENU,
    payload: {
      editableState,
      bool,
    },
  }
}

export function updateSource(source, editableState) {
  return {
    type: UPDATE_SOURCE,
    payload: {
      editableState,
      source,
    },
  }
}
