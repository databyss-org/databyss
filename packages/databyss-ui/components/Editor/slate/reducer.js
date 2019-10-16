import { Block } from 'slate'
import { serializeNodeToHtml, sanitizer } from './inlineSerializer'
import {
  SET_ACTIVE_BLOCK_TYPE,
  SET_ACTIVE_BLOCK_CONTENT,
  INSERT_NEW_ACTIVE_BLOCK,
  SET_BLOCK_TYPE,
  BACKSPACE,
  TOGGLE_MARK,
  HOTKEY,
  CLEAR_BLOCK,
  START_TAG,
} from '../state/constants'
// import { addTag } from '../state/actions'

export const newBlock = id =>
  Block.fromJSON({
    object: 'block',
    type: 'ENTRY',
    key: id,
    nodes: [
      {
        object: 'text',
        text: '',
      },
    ],
  })

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
const handleNewBlockConditions = (activeBlock, editor) => {
  if (isAtomicInlineType(activeBlock.type)) {
    if (
      isAtomicInlineType(editor.value.previousBlock.type) &&
      editor.value.previousBlock.text
    ) {
      editor.setNodeByKey(editor.value.anchorBlock.key, { type: 'ENTRY' })
      return false
    }
    if (!editor.value.previousBlock.text) {
      editor.setNodeByKey(editor.value.previousBlock.key, { type: 'ENTRY' })
      return false
    }
  }

  if (
    // if current block is location and previous block is empty
    // replace with empty block
    activeBlock.type === 'LOCATION' &&
    editor.value.previousBlock.text.length === 0
  ) {
    editor.replaceNodeByKey(
      editor.value.previousBlock.key,
      newBlock(editor.value.previousBlock.key)
    )
    editor.toggleMark('location')
    return false
  }
  // if block break is in the middle of a location
  if (
    activeBlock.type === 'LOCATION' &&
    editor.value.previousBlock.text.length !== 0
  ) {
    return false
  }
  return true
}

const setActiveBlockType = type => (editor, value, next) => {
  const _activeBlock = findActiveBlock(value)

  if (editor.value.activeMarks.size > 0) {
    if (value.marks._map._root) {
      const _marks = value.marks._map._root.entries
      _marks.forEach(m => {
        editor.toggleMark(m[0].type)
      })
    }
  }
  // if set active block type was handled already return true
  if (handleNewBlockConditions(_activeBlock, editor, next)) {
    editor.setNodeByKey(_activeBlock.key, { type })
    next(editor, value)
  }
}

const clearBlockById = id => (editor, value, next) => {
  if (value.document.getNode(id)) {
    editor.replaceNodeByKey(id, newBlock(id))
  }
  next(editor, value)
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
              text: sanitizer(_text),
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

const onHotKey = command => (editor, value, next) => {
  const _node = findActiveBlock(editor.value)
  ;({
    START_OF_LINE: () => editor.moveToStartOfNode(_node),
    END_OF_LINE: () => editor.moveToEndOfNode(_node),
    START_OF_DOCUMENT: () => editor.moveToStartOfDocument(),
    END_OF_DOCUMENT: () => editor.moveToEndOfDocument(),
    NEXT_BLOCK: () => editor.moveToStartOfNextBlock(),
    PREVIOUS_BLOCK: () => editor.moveToStartOfPreviousBlock(),
  }[command]())

  next(editor, value)
}

const startTag = tag => (editor, value, next) => {
  ;({
    SOURCE: () => editor.insertText('@'),
    TOPIC: () => editor.insertText('#'),
    LOCATION: () => editor.toggleMark('location'),
  }[tag]())
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

    case HOTKEY: {
      return {
        ...editableState,
        editorCommands: onHotKey(action.payload.command),
      }
    }
    case CLEAR_BLOCK: {
      return {
        ...editableState,
        editorCommands: clearBlockById(action.payload.id),
      }
    }
    case START_TAG: {
      return {
        ...editableState,
        editorCommands: startTag(action.payload.tag),
      }
    }
    default:
      return editableState
  }
}
