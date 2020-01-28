import { Block } from 'slate'
import { serializeNodeToHtml, sanitizer } from './../inlineSerializer'
import { getRangesFromBlock, stateToSlateMarkup } from './../markup'

import { newEditor, isTextAtomic, newAtomicBlock } from './../slateUtils'
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
  DELETE_BLOCK,
  DELETE_BLOCKS,
  UPDATE_ATOMIC,
} from './../../state/page/constants'

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
  if (editor.value.previousBlock) {
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
  }

  return true
}

const setActiveBlockType = type => (editor, value, next) => {
  const _activeBlock = findActiveBlock(value)

  // if empty block replace all marks/types

  if (_activeBlock.text.length === 0 && editor.value.previousBlock) {
    editor.replaceNodeByKey(_activeBlock.key, newBlock(_activeBlock.key))
    // if previous block exists move caret forward
    editor.moveForward(1)
    next(editor, value)
  }

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
    let _node = editor.value.document.getNode(id)
    let _marks = _node.getMarks().toJSON()

    // mock editor to correct marks
    const _editor = newEditor()
    _editor.insertBlock(_node)

    // issue #117
    // removes @ or #
    _editor.removeTextByKey(
      _editor.value.document.getNode(id).getFirstText().key,
      0,
      1
    )
    _node = _editor.value.document.getNode(id)

    let _text = _node.text
    // if left over @ or #
    _text = isTextAtomic(_text) ? _text.trim().substring(1) : _text.trim()

    // issue #116
    // removes location from atomic types
    if (_marks.find(m => m.type === 'location')) {
      let _ranges = getRangesFromBlock(_node.toJSON()).ranges
      _ranges = _ranges.filter(r => r.marks.includes('location'))
      _ranges.forEach(r => {
        _editor
          .moveToStartOfNode(_node)
          .moveForward(r.offset)
          .moveFocusForward(r.length)
          .removeMark('location')
          .moveFocusBackward(r.length)
          .moveBackward(r.offset)
      })
      // update node and marks
      _node = _editor.value.document.getNode(id)
      _marks = _node.getMarks().toJSON()
    }

    if (_marks.length) {
      _text = serializeNodeToHtml(_node)
    }

    const _block = newAtomicBlock(_node.key, type, _text, _marks)

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

export const toggleMark = mark => (editor, value, next) => {
  editor.toggleMark(mark)
  next(editor, value)
}

export const onHotKey = command => (editor, value, next) => {
  const _node = findActiveBlock(editor.value)
  ;({
    START_OF_LINE: () => editor.moveToStartOfNode(_node),
    END_OF_LINE: () => editor.moveToEndOfNode(_node),
    START_OF_DOCUMENT: () => editor.moveToStartOfDocument(),
    END_OF_DOCUMENT: () => editor.moveToEndOfDocument(),
    NEXT_BLOCK: () => editor.moveToStartOfNextBlock(),
    PREVIOUS_BLOCK: () => editor.moveToStartOfPreviousBlock(),
    TAB: () => editor.insertText('\t'),
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

const deleteBlockById = id => (editor, value, next) => {
  const _previousKey = editor.value.document.getPreviousBlock(id)
  editor.removeNodeByKey(id)
  if (_previousKey === null) {
    editor.focus()
  } else {
    editor.moveFocusToEndOfNode(_previousKey)
  }

  next(editor, value)
}

/*
updates all atomics provided in the ID list
*/
const onUpdateAtomic = (data, blocks) => (editor, value, next) => {
  const { atomic, type } = data
  // generates a list of blocks to update
  const _idList = Object.keys(blocks).filter(
    block => blocks[block].refId === atomic._id
  )
  _idList.forEach(id => {
    const _newNodes = stateToSlateMarkup(atomic.text).nodes
    const _block = Block.fromJSON({
      object: 'block',
      type,
      nodes: _newNodes,
    })
    const _innerHtml = serializeNodeToHtml(_block)
    const textBlock = {
      object: 'inline',
      nodes: [
        {
          object: 'text',
          text: sanitizer(_innerHtml),
        },
      ],
      type,
    }
    const _tempNode = Block.fromJSON({
      object: 'block',
      type,
      key: id,
      nodes: [textBlock],
    })

    editor.replaceNodeByKey(id, _tempNode)
  })

  window.requestAnimationFrame(() => editor.focus())
  next(editor, value)
}

const deleteBlocksByIds = idList => (editor, value, next) => {
  const _firstBlockId = idList.get(0)
  const _previousKey = editor.value.document.getPreviousBlock(_firstBlockId)

  idList.forEach((id, i) => {
    if (_previousKey === null && i === 0) {
      editor.replaceNodeByKey(_firstBlockId, newBlock(_firstBlockId))
    } else {
      editor.removeNodeByKey(id)
    }
  })

  if (_previousKey === null) {
    editor.focus()
  } else {
    editor.moveFocusToEndOfNode(_previousKey)
  }
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
    case UPDATE_ATOMIC: {
      return {
        ...editableState,
        editorCommands: onUpdateAtomic(
          action.payload.data,
          editableState.blocks
        ),
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
    case DELETE_BLOCK: {
      return {
        ...editableState,
        editorCommands: deleteBlockById(action.payload.id),
      }
    }
    case DELETE_BLOCKS: {
      return {
        ...editableState,
        editorCommands: deleteBlocksByIds(action.payload.idList),
      }
    }
    default:
      return editableState
  }
}
