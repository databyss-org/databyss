import { Editor } from 'slate'
import { stateToSlateMarkup } from './markup'
import { serialize } from './inlineSerializer'
import { isAtomicInlineType } from './util'

export const flattenNode = node => {
  if (!node) {
    return null
  }
  if (typeof node.text === 'string') {
    return node.text
  } else if (typeof node.character === 'string') {
    return node.character
  }
  return node.children.map(flattenNode).join('')
}

export const flattenNodeToPoint = (editor, point) => {
  const anchor = {
    path: [point.path[0], 0],
    offset: 0,
  }
  const focus = {
    path: point.path,
    offset: point.offset,
  }
  const _frag = Editor.fragment(editor, { anchor, focus })
  const _string = flattenNode(_frag[0])
  return _string
}

export const flattenOffset = (editor, point) =>
  flattenNodeToPoint(editor, point).length

export const slateSelectionToStateSelection = editor =>
  editor.selection
    ? {
        anchor: {
          index: editor.selection.anchor.path[0],
          offset: flattenOffset(editor, editor.selection.anchor),
        },
        focus: {
          index: editor.selection.focus.path[0],
          offset: flattenOffset(editor, editor.selection.focus),
        },
      }
    : null

// this doesn't work when a node has > 1 text children
// TODO: create an editor, insert fragment and moveFocusForward to get
// correct paths and offsets
export const stateSelectionToSlateSelection = selection => ({
  anchor: {
    path: [selection.anchor.index, 0],
    offset: selection.anchor.offset,
  },
  focus: {
    path: [selection.focus.index, 0],
    offset: selection.focus.offset,
  },
})

export const entities = type =>
  ({ SOURCE: 'sources', TOPIC: 'topics', ENTRY: 'entries' }[type])

export const stateBlockToSlateBlock = block => {
  // convert state and apply markup values
  const _childrenText = stateToSlateMarkup(block.text)
  const _data = {
    children: _childrenText,
    type: block.type,
    isBlock: true,
    isActive: block.isActive,
  }
  return _data
}

/*
convert page state to a slate value on initial mount
*/

export const stateToSlate = initState => {
  const _blocks = initState.blocks
  const _state = _blocks.map(b => {
    // get block ref and id
    const _block = initState.blockCache[b._id]
    const _blockData = initState.entityCache[_block.entityId]
    return stateBlockToSlateBlock(_blockData)
  })

  return _state
}

export const getRangesFromSlate = node => {
  let _offset = 0
  const _ranges = []
  if (!node) {
    return _ranges
  }
  node.children.forEach(n => {
    if (!n.text) {
      return
    }
    const _textLength = n.text.length
    if (n.type) {
      _ranges.push({ offset: _offset, length: _textLength, mark: n.type })
    }
    _offset += _textLength
  })
  return _ranges
}
