import MurmurHash3 from 'imurmurhash'
import { Text, Editor, Node } from '@databyss-org/slate'
import { pickBy } from 'lodash'
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
  const _string = Node.string({ children: _frag })
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

// map between state block stringifies and slate block values
const slateBlockMap = {}

// convert state and apply markup values
export const stateBlockToSlateBlock = block => {
  // object hash
  const _hashBlock = { text: block.text, type: block.type }
  const str = JSON.stringify(_hashBlock)

  const _blockHash = MurmurHash3(str).result()

  // look up block hash in blockCache
  const _slateBlock = slateBlockMap[_blockHash]

  // if block hash exists in dictionary, return the parsed data
  if (_slateBlock) {
    return JSON.parse(_slateBlock.data)
  }

  // CACHE CLEANUP
  // look up any block in dicitonary by same block id
  const _hash = pickBy(slateBlockMap, b => b._id === block._id)

  // if value exists with same id, remove from dictionary
  if (_hash) {
    delete slateBlockMap[Object.keys(_hash)[0]]
  }

  // calculate slate data
  const _childrenText = stateToSlateMarkup(block)

  const _data = {
    children: _childrenText,
    type: block.type,
    isBlock: true,
  }

  // add to blockCache dicitonary
  slateBlockMap[_blockHash] = {
    data: JSON.stringify(_data),
    _id: block._id,
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

// serialize slate node to html for page path header
const serializeHeader = node => {
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

  const children = node.children.map(n => serializeHeader(n)).join('')

  switch (node.type) {
    // case 'SOURCE':
    //   return `<u>${children}</u>`
    default:
      return children
  }
}

// serialize slate node to html for search results
const serializeResults = node => {
  if (Text.isText(node)) {
    // replace line breaks
    let _children = node.text.replace(/\n/g, '</br>')

    if (node.bold) {
      _children = `<strong>${_children}</strong>`
    }
    if (node.italic) {
      _children = `<i>${_children}</i>`
    }
    if (node.location) {
      _children = `<span style="color:#A19A91">${_children}</span>`
    }
    if (node.highlight) {
      // TODO: this should be dynamic
      _children = `<span style="background-color:#F7C96E">${_children}</span>`
      // _children = ReactDOMServer.renderToString(
      //   <View display="inline" backgroundColor="orange.3">
      //     {_children}
      //   </View>
      // )
    }
    return _children
  }

  const children = node.children.map(n => serializeResults(n)).join('')
  switch (node.type) {
    default:
      return children
  }
}

// serialize slate node to html
export const serialize = node => {
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
      return `<u>${children}</u>`
    default:
      return children
  }
}

export const stateBlockToHtmlHeader = stateBlock => {
  const _slateNode = stateBlockToSlateBlock(stateBlock)
  return serializeHeader(_slateNode)
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

export const stateBlocktoHtmlResults = stateBlock => {
  const _slateNode = stateBlockToSlateBlock(stateBlock)

  return serializeResults(_slateNode)
}
