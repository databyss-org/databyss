import { Point, Range } from 'slate'
import { SET_ACTIVE_BLOCK_TYPE, SET_ACTIVE_BLOCK_CONTENT } from './constants'

export const findActiveBlock = value =>
  value.document.getClosestBlock(value.selection.focus.key)

export const findActiveNode = value =>
  value.document.getNode(value.selection.focus.key)

const setActiveBlockType = type => (editor, value, next) => {
  const _activeBlock = findActiveBlock(value)
  editor.setNodeByKey(_activeBlock.key, { type })
  next(editor, value)
}

export default (editableState, action) => {
  switch (action.type) {
    case SET_ACTIVE_BLOCK_CONTENT: {
      if (!action.payload.html.length) {
        return {
          ...editableState,
          editorCommands: setActiveBlockType('ENTRY'),
        }
      }
      return editableState
    }
    case SET_ACTIVE_BLOCK_TYPE: {
      const _nextEditorCommands = setActiveBlockType(action.payload.type)
      if (action.payload.fromSymbolInput) {
        return {
          ...editableState,
          editorCommands: (editor, value, next) => {
            const { key } = findActiveNode(value)
            const _start = Point.create({ key, offset: 0 })
            const _end = Point.create({ key, offset: 1 })
            const _range = Range.create({ anchor: _start, focus: _end })
            editor.deleteForwardAtRange(_range)
            _nextEditorCommands(editor, value, next)
          },
        }
      }
      return {
        ...editableState,
        editorCommands: _nextEditorCommands,
      }
    }
    default:
      return editableState
  }
}
