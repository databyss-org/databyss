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
  ON_CUT,
  SHOW_MENU_ACTIONS,
  SHOW_FORMAT_MENU,
  ON_PASTE,
  SET_BLOCK_REF,
  SHOW_NEW_BLOCK_MENU,
  ON_SELECTION,
  ADD_DIRTY_ATOMIC,
  DEQUEUE_DIRTY_ATOMIC,
  UPDATE_ATOMIC,
  DEQUEUE_NEW_ATOMIC,
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

export function cutBlocks(idList, refId, id, editableState) {
  return {
    type: ON_CUT,
    payload: {
      idList,
      refId,
      id,
      editableState,
    },
  }
}

export function onPaste(pasteData, editableState) {
  return {
    type: ON_PASTE,
    payload: {
      editableState,
      pasteData,
    },
  }
}

export function onSetBlockRef(_id, refId, editableState) {
  return {
    type: SET_BLOCK_REF,
    payload: {
      editableState,
      _id,
      refId,
    },
  }
}

export function newBlockMenu(bool) {
  return {
    type: SHOW_NEW_BLOCK_MENU,
    payload: {
      bool,
    },
  }
}

export function updateAtomic(data) {
  return {
    type: UPDATE_ATOMIC,
    payload: {
      data,
    },
  }
}

export function removeAtomicFromQueue(id) {
  return {
    type: DEQUEUE_NEW_ATOMIC,
    payload: {
      id,
    },
  }
}

export function onSelection(editableState) {
  return {
    type: ON_SELECTION,
    payload: {
      editableState,
    },
  }
}

export function addDirtyAtomic(refId, type) {
  return {
    type: ADD_DIRTY_ATOMIC,
    payload: {
      refId,
      type,
    },
  }
}

export function dequeueDirtyAtomic(refId) {
  return {
    type: DEQUEUE_DIRTY_ATOMIC,
    payload: refId,
  }
}
