import { createEditor, Transforms } from '@databyss-org/slate'
import cloneDeep from 'clone-deep'
import { toggleMark } from './slateUtils'

const moveToStart = (editor) => {
  const _zero = { path: [0], offset: 0 }
  Transforms.setSelection(editor, { anchor: _zero, focus: _zero })
}

export const applyRange = (editor, range) => {
  moveToStart(editor)
  // move anchor and focus to highlight text to add mark
  Transforms.move(editor, { distance: range.offset + 1, edge: 'anchor' })
  Transforms.move(editor, {
    distance: range.offset + range.length,
    edge: 'focus',
  })

  // HACK:
  // There is a bug in Slate that causes unexpected behavior when creating a
  // selection by doing `Transforms.move` on the anchor and focus. If the
  // selection falls on a range that already has a mark, the focus gets the
  // correct path (pointing within the mark leaf) but the anchor gets the parent
  // path. The fix for this is to overshoot the anchor by 1 (we do that above)
  // and correct the offset with an additional move, below.
  Transforms.move(editor, { distance: 1, edge: 'anchor', reverse: true })

  // apply marks array
  if (range.marks) {
    range.marks.forEach((mark) => {
      toggleMark(editor, mark)
    })
  }

  return editor
}

export const statePointToSlatePoint = (children, point) => {
  const { index, offset: flatOffset } = point

  // if index does not exist in editor, reset selection at 0
  if (!children[index]) {
    return { path: [0, 0], offset: 0 }
  }

  const _editor = createEditor()
  const _text = {
    children: children[index].children,
  }
  Transforms.insertNodes(_editor, _text)
  moveToStart(_editor)
  Transforms.move(_editor, {
    distance: flatOffset,
    edge: 'focus',
    unit: 'character',
  })

  const { path, offset } = _editor.selection.focus
  const _path = [...path]
  _path[0] = index
  const _point = { path: _path, offset }
  const selection = { anchor: _point, focus: _point }
  return selection.focus
}

export function flattenRanges(ranges) {
  const flattened = []
  for (let i = 0; i < ranges.length; i += 1) {
    const range = ranges[i]
    const nextRange = ranges[i + 1]
    if (!nextRange) {
      // we're at the end
      flattened.push(range)
      // eslint-disable-next-line no-continue
      continue
    }
    if (nextRange.offset >= range.offset + range.length) {
      // already flat
      flattened.push(range)
      // eslint-disable-next-line no-continue
      continue
    }
    // skip nextRange in next loop because we're combining below
    i += 1
    const newLen1 = nextRange.offset - range.offset
    // if current range extends before the next range, then we need block1
    if (range.offset < nextRange.offset) {
      const newBlock1 = {
        ...range,
        length: newLen1,
      }
      flattened.push(newBlock1)
    }
    const newMarks2 = [...nextRange.marks, ...range.marks]
    let newLen2 = nextRange.length
    // if next range extends beyond end of current range
    if (range.offset + range.length < nextRange.offset + nextRange.length) {
      newLen2 = range.offset + range.length - nextRange.offset
    }
    const newBlock2 = { ...nextRange, marks: newMarks2, length: newLen2 }
    flattened.push(newBlock2)
    // if current range extends beyond next range, we need a 3rd block
    if (range.offset + range.length > nextRange.offset + nextRange.length) {
      const newOffset3 = nextRange.offset + nextRange.length
      const newLen3 = range.offset + range.length - newOffset3
      const newBlock3 = {
        offset: newOffset3,
        length: newLen3,
        marks: range.marks,
      }
      flattened.push(newBlock3)
    }
  }
  return flattened
}

export const stateToSlateMarkup = (block) => {
  // flatten all ranges
  const _ranges = flattenRanges(block.text.ranges)

  const _text = block.text.textValue

  let _currentIndex = 0

  const _children = []

  // if ranges dont exist, return plain text
  if (!_ranges.length) {
    _children.push({ text: _text })
  }

  _ranges.forEach((b, i) => {
    // if plain words exist
    if (_currentIndex !== b.offset) {
      const _plainTextLength = b.offset - _currentIndex
      const _plainText = _text.substr(_currentIndex, _plainTextLength)
      // push plain word and update current index
      _children.push({ text: _plainText })
      _currentIndex += _plainTextLength
    }

    const text = _text.substring(b.offset, b.offset + b.length)

    const ranges = {}
    b.marks.forEach((m) => {
      // check if current mark is a tuple,
      if (Array.isArray(m)) {
        // if so, mark both items: atomic type, and id in slate block
        ranges[m[0]] = true
        ranges.atomicId = m[1]
      } else {
        ranges[m] = true
      }
    })
    _currentIndex += b.length
    _children.push({ text, ...ranges })
    // if last element in array, check for left over text
    if (i === _ranges.length - 1) {
      const _len = _text.length - _currentIndex
      const _plainText = _text.substr(_currentIndex, _len)
      if (_plainText.length) {
        _children.push({ text: _plainText })
      }
    }
  })
  return _children
}

export const getRangesFromBlock = (value) => {
  const nodes = value[0].children
  let text = ''
  return {
    ranges: nodes
      .map((n, i) => {
        const _nodes = cloneDeep(nodes)
        const keys = Object.keys(n).filter((k) => k !== 'text')

        // compile full text
        text += n.text
        let range = {}
        if (keys.length) {
          // find length of all previous nodes
          _nodes.splice(i)
          const previousTextLength = _nodes.reduce(
            (total, current) => total + current.text.length,
            0
          )
          // create range object
          range = {
            offset: previousTextLength,
            length: n.text.length,
            marks: keys.map((k) => k),
          }
        }

        return range
      })
      .filter((x) => x.length != null),
    textValue: text,
  }
}
