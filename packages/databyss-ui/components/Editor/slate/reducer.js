import { Block } from 'slate'
import xss from 'xss'
import { serializeNodeToHtml } from './inlineSerializer'
import {
  SET_ACTIVE_BLOCK_TYPE,
  SET_ACTIVE_BLOCK_CONTENT,
  INSERT_NEW_ACTIVE_BLOCK,
  SET_BLOCK_TYPE,
  BACKSPACE,
  TOGGLE_MARK,
} from '../state/constants'

export const findActiveBlock = value =>
  value.document.getClosestBlock(value.selection.focus.key)

export const findActiveNode = value =>
  value.document.getNode(value.selection.focus.key)

export const isAtomicInlineType = type => {
  switch (type) {
    case 'SOURCE':
      return true
    case 'TOPIC':
      return true
    default:
      return false
  }
}

const setActiveBlockType = type => (editor, value, next) => {
  const _activeBlock = findActiveBlock(value)

  // clears all active marks
  if (editor.value.activeMarks.size > 0) {
    if (value.marks._map._root) {
      const _marks = value.marks._map._root.entries
      _marks.forEach(m => {
        editor.toggleMark(m[0].type)
      })
    }
  }

  if (isAtomicInlineType(_activeBlock.type)) {
    // if previous value is SOURCE and is currently not empty
    // set current block type as ENTRY
    if (
      isAtomicInlineType(editor.value.previousBlock.type) &&
      editor.value.previousBlock.text
    ) {
      editor.setNodeByKey(editor.value.anchorBlock.key, { type: 'ENTRY' })
    }
    // if active block is SOURCE set node type to SOURCE
    // if previous block text is empty, set previous to ENTRY
    if (!editor.value.previousBlock.text) {
      editor.setNodeByKey(editor.value.previousBlock.key, { type: 'ENTRY' })
    }
  } else {
    editor.setNodeByKey(_activeBlock.key, { type })
    next(editor, value)
  }
}

const setBlockType = (id, type) => (editor, value, next) => {
  if (isAtomicInlineType(type)) {
    const _node = value.document.getNode(id)

    let _text = _node.text
    const _marks = _node.getMarks().toJSON()

    if (_marks.length) {
      _text = serializeNodeToHtml(_node)
    }
    if (_text.startsWith('@') || _text.startsWith('#')) {
      _text = _text.substring(1)
    }

    _text = xss(_text, {
      whiteList: [],
      stripIgnoreTag: false,
      stripIgnoreTagBody: ['script'],
    })

    const _block = Block.fromJSON({
      object: 'block',
      type,
      key: _node.key,
      data: {},
      nodes: [
        {
          object: 'text',
          text: '',
          marks: [],
        },
        {
          object: 'inline',
          type,
          data: {},
          nodes: [
            {
              object: 'text',
              text: _text,
              //  text: sanitizer(_text),
              marks: _marks,
            },
          ],
        },
        {
          object: 'text',
          text: '',
          marks: [],
        },
      ],
    })
    editor.replaceNodeByKey(id, _block)
  } else {
    editor.setNodeByKey(id, { type })
  }
  next(editor, value)
}

const backspace = () => (editor, value, next) => {
  // if current block is empty and block type is SOURCE
  // set block type to ENTRY
  const _block = value.anchorBlock
  if (!_block.text && isAtomicInlineType(_block.type)) {
    editor.setNodeByKey(_block.key, { type: 'ENTRY' })
  }
  next(editor, value)
}

const toggleMark = mark => (editor, value, next) => {
  editor.toggleMark(mark)
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
    case INSERT_NEW_ACTIVE_BLOCK:
      return { ...editableState, editorCommands: setActiveBlockType('ENTRY') }
    case BACKSPACE:
      const _nextEditorCommands = backspace()
      return {
        ...editableState,
        editorCommands: _nextEditorCommands,
      }
    case TOGGLE_MARK:
      return {
        ...editableState,
        editorCommands: toggleMark(action.payload.mark),
      }
    case SET_BLOCK_TYPE: {
      const _nextEditorCommands = setBlockType(
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
      return {
        ...editableState,
        editorCommands: _nextEditorCommands,
      }
    }
    default:
      return editableState
  }
}
