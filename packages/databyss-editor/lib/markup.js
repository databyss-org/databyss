import { createEditor, Transforms, Text } from 'slate'

export const stateToSlateMarkup = blockData => {
  // create empty value
  const _editor = createEditor()
  const _text = {
    children: [{ text: blockData.textValue }],
  }

  Transforms.insertNodes(_editor, _text)

  const _offset = _editor.selection.anchor.offset

  // MOVE ANCHOR AND FOCUS TO START OF NODE
  Transforms.move(_editor, { distance: _offset, edge: 'anchor', reverse: true })
  Transforms.move(_editor, { distance: _offset, edge: 'focus', reverse: true })

  const reducer = (editor, range) => {
    const _editor = editor
    // move anchor and focus to highlight text to add mark
    Transforms.move(_editor, { distance: range.offset, edge: 'anchor' })
    Transforms.move(_editor, {
      distance: range.offset + range.length,
      edge: 'focus',
    })
    const _anchor = _editor.selection.anchor
    const _focus = _editor.selection.focus
    const _range = {
      anchor: _anchor,
      focus: _focus,
    }

    // add type to be used for html seralizer in atomic blocks
    Transforms.setNodes(
      _editor,
      { [range.mark]: true, type: range.mark },
      {
        at: _range,
        match: node => Text.isText(node),
        split: true,
      }
    )

    // move anchor and focus back to start
    Transforms.move(_editor, {
      distance: range.offset,
      edge: 'anchor',
      reverse: true,
    })
    Transforms.move(_editor, {
      distance: range.offset + range.length,
      edge: 'focus',
      reverse: true,
    })

    return _editor
  }

  const __editor = blockData.ranges.reduce(reducer, _editor)

  return __editor.children[0].children
}
