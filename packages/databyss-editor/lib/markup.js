import { createEditor, Transforms } from 'slate'
import { toggleMark } from './slateUtils'

const moveToStart = editor => {
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
  range.marks &&
    range.marks.forEach(mark => {
      toggleMark(editor, mark)
    })

  return editor
}

export const statePointToSlatePoint = (children, point) => {
  const { index, offset: flatOffset } = point

  if (!children[index]) {
    return { path: [index, 0], offset: 0 }
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

export const stateToSlateMarkup = blockData => {
  // create temp editor and insert the text value
  const _editor = createEditor()
  const _text = {
    children: [{ text: blockData.textValue }],
  }
  Transforms.insertNodes(_editor, _text)

  // apply all ranges as marks
  moveToStart(_editor)

  blockData.ranges.forEach(range => applyRange(_editor, range))

  const { children } = _editor.children[0]

  return children
}
