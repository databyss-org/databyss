import { Point, Range } from 'slate'
import {
  SET_ACTIVE_BLOCK_TYPE,
  SET_ACTIVE_BLOCK_CONTENT,
  INSERT_BLOCK,
  SET_BLOCK_ID_TYPE,
} from './constants'

export const findActiveBlock = value =>
  value.document.getClosestBlock(value.selection.focus.key)

export const findActiveNode = value =>
  value.document.getNode(value.selection.focus.key)

const setActiveBlockType = type => (editor, value, next) => {
  const _activeBlock = findActiveBlock(value)
  editor.setNodeByKey(_activeBlock.key, { type })
  next(editor, value)
}

//NOT WORKING
const setBlockIdType = (id, type) => (editor, value, next) => {
  const _list = value.document.getBlocks()._tail.array
  const _block = _list.find(b => b.key === id)
  const _textKey = _block.getFirstText().key
  // SETTING IT FROM TEXT KEY
  editor.setNodeByKey(_textKey, { type })
  // SETTING IT FROM OUR BLOCK ID
  editor.setNodeByKey(id, { type })

  next(editor, value)
}

export default (editableState, action) => {
  switch (action.type) {
    case SET_ACTIVE_BLOCK_CONTENT: {
      if (!action.payload.html.length) {
        return {
          ...editableState,
        }
      }
      return editableState
    }
    case INSERT_BLOCK:
      return { ...editableState, editorCommands: setActiveBlockType('ENTRY') }

    case SET_BLOCK_ID_TYPE: {
      const _nextEditorCommands = setBlockIdType(
        action.payload.id,
        action.payload.type
      )
      return {
        ...editableState,
        editorCommands: _nextEditorCommands,
      }
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
