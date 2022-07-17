import MurmurHash3 from 'imurmurhash'
import { Text, Editor, Node, Range, Transforms } from '@databyss-org/slate'
import { pickBy } from 'lodash'
import { textToHtml } from '@databyss-org/services/blocks'
import { isAtomicInlineType } from './util'
import {
  stateToSlateMarkup,
  statePointToSlatePoint,
  flattenRanges,
} from './markup'

export const flattenNode = (node) => {
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

export const slateSelectionToStateSelection = (editor) =>
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

export const entities = (type) =>
  ({ SOURCE: 'sources', TOPIC: 'topics', ENTRY: 'entries' }[type])

// map between state block stringifies and slate block values
const slateBlockMap = {}

export const stateBlockToHtml = (block) => {
  // replace non width white space with a white space
  const _text = block.text.textValue.replace('\uFEFF', ' ')
  const _ranges = flattenRanges(block.text.ranges)
  return textToHtml({
    textValue: _text,
    ranges: _ranges,
  })
}

// convert state and apply markup values
export const stateBlockToSlateBlock = (block) => {
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
  const _hash = pickBy(slateBlockMap, (b) => b._id === block._id)

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

export const stateToSlate = ({ blocks }) => {
  const _children = blocks.map((_block, index) => ({
    ...stateBlockToSlateBlock(_block),
    isTitle: !index,
  }))
  return _children
}
const allowedRanges = [
  'bold',
  'italic',
  'location',
  'link',
  'inlineAtomicMenu',
  'inlineTopic',
  'inlineCitation',
  'embed',
  'inlineEmbedInput',
  'inlineLinkInput',
]

const allowedInlines = ['inlineTopic', 'inlineCitation', 'embed', 'link']

export const slateRangesToStateRanges = (node) => {
  let _offset = 0
  const _ranges = []
  if (!node) {
    return _ranges
  }
  node.children.forEach((child) => {
    if (!child.text) {
      return
    }
    const _textLength = child.text.length
    // check if range is inline type
    const _inlineType = Object.keys(child).filter((prop) =>
      allowedInlines.includes(prop)
    )

    if (_inlineType.length) {
      const marks = [[_inlineType[0], child.atomicId]]
      // if object contains an object id, search for allowed atomic
      _ranges.push({
        offset: _offset,
        length: _textLength,
        marks,
      })
    } else {
      Object.keys(child).forEach((prop) => {
        if (allowedRanges.includes(prop) && child[prop]) {
          _ranges.push({ offset: _offset, length: _textLength, marks: [prop] })
        }
      })
    }

    _offset += _textLength
  })
  return _ranges
}

export const isFormatActive = (editor, format) => {
  const [match] = Editor.nodes(editor, {
    match: (n) => n[format] === true,
    mode: 'all',
  })
  return !!match
}

/*
checks selection for inline types
*/
export const isSelectionAtomic = (editor) => {
  const _frag = Editor.fragment(editor, editor.selection)
  return !_frag.reduce(
    (acc, curr) => acc * !isAtomicInlineType(curr.type),
    true
  )
}

export const isMarkActive = (editor, format) => {
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
const serializeHeader = (node) => {
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

  const children = node.children.map((n) => serializeHeader(n)).join('')

  switch (node.type) {
    // case 'SOURCE':
    //   return `<u>${children}</u>`
    default:
      return children
  }
}

// serialize slate node to html
export const serialize = (node) => {
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

  const children = node.children.map((n) => serialize(n)).join('')

  switch (node.type) {
    case 'SOURCE':
      return `<u>${children}</u>`
    default:
      return children
  }
}

export const stateBlockToHtmlHeader = (stateBlock) => {
  const _slateNode = stateBlockToSlateBlock(stateBlock)
  return serializeHeader(_slateNode)
}

export const stateToHTMLString = (frag) => {
  const _innerHtml = frag
    .map((b) => {
      const _slateNode = stateBlockToSlateBlock(b)
      return `<p>${serialize(_slateNode)}</p>`
    })
    .join('')
    .replace(/\n/g, '<br />')

  return `<span>${_innerHtml}</span>`
}

export const isCurrentlyInInlineAtomicField = (editor) => {
  if (
    isMarkActive(editor, 'inlineAtomicMenu') &&
    Range.isCollapsed(editor.selection)
  ) {
    return true
  }
  return false
}

export const isCurrentlyInInlineEmbedInput = (editor) => {
  if (
    isMarkActive(editor, 'inlineEmbedInput') &&
    Range.isCollapsed(editor.selection)
  ) {
    return true
  }
  return false
}

export const isCurrentlyInInlineLinkInput = (editor) => {
  if (
    isMarkActive(editor, 'inlineLinkInput') &&
    Range.isCollapsed(editor.selection)
  ) {
    return true
  }
  return false
}

/*
returns all blocks which contain an inline or atomic block with provided id ignoring closure blocks
*/

export const getBlocksWithAtomicId = (blocks, id) => {
  const _atomicBlocks = blocks.filter(
    (b) => b._id === id && b.text.textValue.charAt(0) !== '/'
  )

  const _inlineBlocks = blocks.filter(
    (b) =>
      b.text.ranges.filter(
        (r) =>
          r.marks.filter(
            (m) =>
              Array.isArray(m) &&
              m.length === 2 &&
              (m[0] === 'inlineTopic' ||
                m[0] === 'inlineCitation' ||
                m[0] === 'embed') &&
              m[1] === id
          ).length
      ).length
  )
  return { atomicBlocks: _atomicBlocks, inlineBlocks: _inlineBlocks }
}

export const getInlineFromBlock = (block, id) =>
  block.text.ranges
    .map((r) =>
      r.marks.filter(
        (m) =>
          Array.isArray(m) &&
          m.length === 2 &&
          (m[0] === 'inlineTopic' ||
            m[0] === 'inlineCitation' ||
            m[0] === 'embed') &&
          m[1] === id
      )
    )
    .filter((r) => r.length)

export const isCharacterKeyPress = (evt) => {
  if (typeof evt.which === 'undefined') {
    // This is IE, which only fires keypress events for printable keys
    return true
  } else if (typeof evt.which === 'number' && evt.which > 0) {
    /*
    return false if navigation keys
    */
    const _which = evt.which
    if (_which > 36 && _which < 41) {
      return false
    }
    // In other browsers except old versions of WebKit, evt.which is
    // only greater than zero if the keypress is a printable key.
    // We need to filter out backspace and ctrl/alt/meta key combinations
    return !evt.ctrlKey && !evt.metaKey && !evt.altKey && evt.which !== 8
  }
  return false
}

/*
edge case for manually entereing text, this will not allow inline blocks
*/
export const insertTextWithInilneCorrection = (text, editor) => {
  if (Range.isCollapsed(editor.selection)) {
    const _atBlockStart =
      editor.selection.focus.path[1] === 0 &&
      editor.selection.focus.offset === 0
    let _currentLeaf = Node.leaf(editor, editor.selection.focus.path)
    const _atLeafStart = editor.selection.focus.offset === 0

    // if current leaf is an inline and we are at the start edge of the leaf, jog editor back one space and forward in order to reset marks
    if (
      _atLeafStart &&
      !_atBlockStart &&
      (_currentLeaf.inlineTopic ||
        _currentLeaf.inlineCitation ||
        _currentLeaf.embed)
    ) {
      Transforms.move(editor, {
        unit: 'character',
        distance: 1,
        reverse: true,
      })
      Transforms.move(editor, {
        unit: 'character',
        distance: 1,
      })
      _currentLeaf = Node.leaf(editor, editor.selection.focus.path)
    }

    Transforms.insertText(editor, text)
    // if inserted text has inline mark, remove mark
    if (
      _currentLeaf.inlineTopic ||
      _currentLeaf.inlineCitation ||
      _currentLeaf.embed
    ) {
      Transforms.move(editor, {
        unit: 'character',
        distance: text.length,
        edge: 'anchor',
        reverse: true,
      })

      Editor.removeMark(editor, 'embed')
      Editor.removeMark(editor, 'inlineCitation')
      Editor.removeMark(editor, 'inlineTopic')
      Editor.removeMark(editor, 'atomicId')

      Transforms.collapse(editor, {
        edge: 'focus',
      })
    }
  }
}

/*
if character is being entered, run the editor through the correction to make sure no atomic inline is entered manually
*/
export const inlineAtomicBlockCorrector = ({ event, editor, state }) => {
  if (Range.isCollapsed(editor.selection)) {
    // pressed key is a char
    const _text = Node.string(editor.children[editor.selection.focus.path[0]])
    const _offset = parseInt(flattenOffset(editor, editor.selection.focus), 10)

    // check if previous character is a white space, if so, remove whitespace and recalculate text and offset
    const _prevWhiteSpace =
      _text.charAt(_offset - 1) === '\u2060' ||
      _text.charAt(_offset - 1) === '\uFEFF'

    if (_prevWhiteSpace) {
      Transforms.delete(editor, {
        distance: 1,
        unit: 'character',
        reverse: true,
      })
      return true
    }
    /*
    if offset is not zero and previous node is an atomic inline, move cursor to have active inline mark
    */
    if (_offset > 0 && event.key === 'Backspace') {
      const _prev = Editor.previous(editor)
      if (
        _prev?.length &&
        (Editor.previous(editor)[0]?.inlineTopic ||
          Editor.previous(editor)[0]?.inlineCitation ||
          Editor.previous(editor)[0]?.embed)
      ) {
        Transforms.move(editor, {
          unit: 'character',
          distance: 1,
          reverse: true,
        })
        Transforms.move(editor, {
          unit: 'character',
          distance: 1,
        })
      }
    }

    // move backwards and forward to get selection in previous leaf if previous node exist, this is to get the correct leaf
    if (
      editor.selection.focus.offset === 0 &&
      state.selection.anchor.offset !== 0
    ) {
      const _prev = Editor.previous(editor)
      if (_prev) {
        Transforms.move(editor, {
          distance: 1,
          reverse: true,
          unit: 'character',
        })
        Transforms.move(editor, { distance: 1, unit: 'character' })
      }
    }

    let _currentLeaf = Node.leaf(editor, editor.selection.focus.path)

    /**
     * if current text is in inline link, check if at start or beginning, if so toggle mark off
     */
    if (_currentLeaf?.link && event.key !== 'Backspace') {
      const _atLeafEnd =
        _currentLeaf.text.length === editor.selection.focus.offset
      if (_atLeafEnd) {
        Editor.removeMark(editor, 'link')
        Editor.removeMark(editor, 'atomicId')
      }
    }

    // Edge case: check if between a `\n` new line and the start of an inline atomic
    const _prevNewLine = _text.charAt(_offset - 1) === '\n'
    const _atBlockEnd = _offset === _text.length

    // if were not at the end of a block and key is not backspace, check if inlineAtomic should be toggled
    if (
      _prevNewLine &&
      !_atBlockEnd &&
      event.key !== 'Backspace' &&
      event.key !== 'Tab'
    ) {
      _currentLeaf = Node.leaf(editor, editor.selection.focus.path)

      const _atLeafEnd =
        _currentLeaf.text.length === editor.selection.focus.offset
      // move selection forward one
      if (
        _atLeafEnd &&
        !(
          _currentLeaf.inlineTopic ||
          _currentLeaf.inlineCitation ||
          _currentLeaf.embed
        )
      ) {
        Transforms.move(editor, {
          unit: 'character',
          distance: 1,
        })
        _currentLeaf = Node.leaf(editor, editor.selection.focus.path)
        Transforms.move(editor, {
          unit: 'character',
          distance: 1,
          reverse: true,
        })
      }
      // remove marks before text is entered
      if (
        _currentLeaf.inlineTopic ||
        _currentLeaf.inlineCitation ||
        _currentLeaf.embed
      ) {
        Editor.removeMark(editor, 'inlineTopic')
        Editor.removeMark(editor, 'inlineCitation')
        Editor.removeMark(editor, 'embed')
        Editor.removeMark(editor, 'atomicId')
      }
    }
  } else if (isMarkActive(editor, 'link')) {
    // if range is not collapsed, check to see if active link markup, if so remove markup
    toggleMark(editor, 'link')
  }

  return false
}
