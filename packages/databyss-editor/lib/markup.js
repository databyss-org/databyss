import { createEditor, Transforms } from 'slate'
import { toggleMark } from './slateUtils'

const moveToStart = editor => {
  const _zero = { path: [0], offset: 0 }
  Transforms.setSelection(editor, { anchor: _zero, focus: _zero })
}

export const applyRange = (editor, range) => {
  // move anchor and focus to highlight text to add mark

  // BUG: Transform.move leaves empty leaf node
  Transforms.move(editor, { distance: range.offset + 1, edge: 'anchor' })

  Transforms.move(editor, {
    distance: range.offset + range.length,
    edge: 'focus',
  })
  // BUG: Transform.move must be toggled in order to create the correct slelection
  Transforms.move(editor, { distance: 1, edge: 'anchor', reverse: true })

  toggleMark(editor, range.mark)
  moveToStart(editor)

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

  blockData.ranges.reduce((acc, curr) => {
    applyRange(acc, curr)
    return acc
  }, _editor)

  const { children } = _editor.children[0]

  return children
}
