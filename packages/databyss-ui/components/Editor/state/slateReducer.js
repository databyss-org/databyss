import { Point, Range } from 'slate'
import { SET_ACTIVE_BLOCK_TYPE, SET_ACTIVE_BLOCK_CONTENT } from './constants'

export const findActiveBlock = editableState =>
  editableState.value.document.getClosestBlock(
    editableState.value.selection.focus.key
  )

const setActiveBlockType = (editableState, type) => {
  const _activeBlock = findActiveBlock(editableState)
  const _nextEditor = editableState.editor.setNodeByKey(_activeBlock.key, {
    type,
  })
  return {
    editor: _nextEditor,
    value: _nextEditor.controller.value,
  }
}

export default (editableState, action) => {
  switch (action.type) {
    case SET_ACTIVE_BLOCK_CONTENT: {
      if (!action.payload.html.length) {
        return setActiveBlockType(editableState, 'ENTRY')
      }
      return editableState
    }
    case SET_ACTIVE_BLOCK_TYPE: {
      // let _nextEditableState = setActiveBlockType(
      //   editableState,
      //   action.payload.type
      // )
      if (action.payload.fromSymbolInput) {
        const { key } = findActiveBlock(editableState)
        const _start = Point.create({ key, offset: 0 })
        const _end = Point.create({ key, offset: 1 })
        const _range = Range.create({ anchor: _start, focus: _end })
        const _nextEditor = editableState.editor.deleteForwardAtRange(_range)
        return {
          editor: _nextEditor,
          value: _nextEditor.controller.value,
        }
      }
      return editableState
    }
    default:
      return editableState
  }
}
