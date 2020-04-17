import { createEditor, Transforms, Text } from 'slate'

export const applyRange = (editor, range) => {
  // move anchor and focus to highlight text to add mark
  Transforms.move(editor, { distance: range.offset, edge: 'anchor' })
  Transforms.move(editor, {
    distance: range.offset + range.length,
    edge: 'focus',
  })
  const _anchor = editor.selection.anchor
  const _focus = editor.selection.focus
  const _range = {
    anchor: _anchor,
    focus: _focus,
  }

  // add type to be used for html seralizer in atomic blocks
  Transforms.setNodes(
    editor,
    { [range.mark]: true, type: range.mark },
    {
      at: _range,
      match: node => Text.isText(node),
      split: true,
    }
  )

  // move anchor and focus back to start
  Transforms.move(editor, {
    distance: range.offset,
    edge: 'anchor',
    reverse: true,
  })
  Transforms.move(editor, {
    distance: range.offset + range.length,
    edge: 'focus',
    reverse: true,
  })

  return editor
}

const moveToStart = editor => {
  const _zero = { path: [0], offset: 0 }
  Transforms.setSelection(editor, { anchor: _zero, focus: _zero })
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
