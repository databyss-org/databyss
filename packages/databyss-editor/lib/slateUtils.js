import { Editor, Text } from '@databyss-org/slate'
import { isAtomicInlineType } from './util'
import { stateToSlateMarkup, statePointToSlatePoint } from './markup'

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
  (flattenNodeToPoint(editor, point) || '').length

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

export const stateSelectionToSlateSelection = (children, selection) => {
  const _selection = {
    anchor: statePointToSlatePoint(children, selection.anchor),
    focus: statePointToSlatePoint(children, selection.focus),
  }
  // For selections, Slate Point must have length 2
  if (_selection.anchor.path.length === 1) {
    _selection.anchor.path.push(0)
  }
  if (_selection.focus.path.length === 1) {
    _selection.focus.path.push(0)
  }
  return _selection
}

export const entities = type =>
  ({ SOURCE: 'sources', TOPIC: 'topics', ENTRY: 'entries' }[type])

export const stateBlockToSlateBlock = block => {
  // convert state and apply markup values

  const _childrenText = stateToSlateMarkup(block.text)
  const _data = {
    children: _childrenText,
    type: block.type,
    isBlock: true,
  }

  return _data
}

/*
convert page state to a slate value on initial mount
*/

export const stateToSlate = initState => {
  const _blocks = initState.blocks
  const _state = _blocks.map(_block => stateBlockToSlateBlock(_block))
  return _state
}

const allowedRanges = ['bold', 'italic', 'location']

export const slateRangesToStateRanges = node => {
  let _offset = 0
  const _ranges = []
  if (!node) {
    return _ranges
  }
  node.children.forEach(child => {
    if (!child.text) {
      return
    }
    const _textLength = child.text.length

    Object.keys(child).forEach(prop => {
      if (allowedRanges.includes(prop)) {
        _ranges.push({ offset: _offset, length: _textLength, marks: [prop] })
      }
    })

    _offset += _textLength
  })

  return _ranges
}

export const isFormatActive = (editor, format) => {
  const [match] = Editor.nodes(editor, {
    match: n => n[format] === true,
    mode: 'all',
  })
  return !!match
}

/*
checks selection for inline types
*/
export const isSelectionAtomic = editor => {
  const _frag = Editor.fragment(editor, editor.selection)
  return !_frag.reduce(
    (acc, curr) => acc * !isAtomicInlineType(curr.type),
    true
  )
}

const isMarkActive = (editor, format) => {
  const marks = Editor.marks(editor)
  return marks ? marks[format] === true : false
}

export const toggleMark = (editor, format) => {
  const isActive = isMarkActive(editor, format)
  if (isActive) {
    Editor.removeMark(editor, format)
  } else {
    Editor.addMark(editor, format, true)
  }
}

// serialize slate node to html
const serialize = node => {
  if (Text.isText(node)) {
    let _children = node.text

    if (node.bold) {
      _children = `<strong>${_children}</strong>`
    }
    if (node.italic) {
      _children = `<i>${_children}</i>`
    }
    return _children
  }

  const children = node.children.map(n => serialize(n)).join('')

  switch (node.type) {
    case 'SOURCE':
      return `<u style="font-size:18pt">${children}</u>`
    default:
      return children
  }
}

export const stateToHTMLString = frag => {
  const _innerHtml = frag
    .map(b => {
      const _slateNode = stateBlockToSlateBlock(b)
      return `<p>${serialize(_slateNode)}</p>`
    })
    .join('')
    .replace(/\n/g, '<br />')

  return `<span>${_innerHtml}</span>`
}
