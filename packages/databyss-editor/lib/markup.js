import { createEditor, Transforms, Text, Editor, Node } from 'slate'
import { toggleMark } from './slateUtils'

export const applyRange = (editor, range) => {
  // move anchor and focus to highlight text to add mark
  Transforms.move(editor, { distance: range.offset, edge: 'anchor' })

  Transforms.move(editor, {
    distance: range.offset + range.length,
    edge: 'focus',
  })

  // let _frag = Editor.fragment(editor, editor.selection)

  // if (!_frag[0].children[0].text.length) {
  // Transforms.move(editor, { distance: 1, edge: 'anchor' })
  // // console.log('leading edge is empty')
  // //  console.log('frag', _frag)
  // Transforms.move(editor, { distance: 1, edge: 'anchor', reverse: true })
  // }

  const _anchor = editor.selection.anchor
  const _focus = editor.selection.focus
  const _range = {
    anchor: _anchor,
    focus: _focus,
  }

  // const isMarkActive = (editor, format) => {
  //   const marks = Editor.marks(editor)
  //   return marks ? marks[format] === true : false
  // }

  // const toggleMark = (editor, format) => {
  //   const isActive = isMarkActive(editor, format)
  //   if (isActive) {
  //     Editor.removeMark(editor, format)
  //   } else {
  //     Editor.addMark(editor, format, true)
  //   }
  // }

  toggleMark(editor, range.mark)

  // add type to be used for html seralizer in atomic blocks

  // Transforms.setNodes(
  //   editor,
  //   { [range.mark]: true },
  //   {
  //     //  at: editor.selection,
  //     match: node => {
  //       // console.log(node)
  //       //  console.log(Node.string(node))
  //       return Text.isText(node)
  //       // return false
  //     },
  //     split: true,
  //   }
  // )

  // _frag = Editor.fragment(editor, editor.selection)
  // console.log('frag', _frag)

  moveToStart(editor)
  // // move anchor and focus back to start
  // Transforms.move(editor, {
  //   distance: range.offset,
  //   edge: 'anchor',
  //   reverse: true,
  // })
  // Transforms.move(editor, {
  //   distance: range.offset + range.length,
  //   edge: 'focus',
  //   reverse: true,
  // })

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
  let _editor = createEditor()
  const _text = {
    children: [{ text: blockData.textValue }],
  }
  Transforms.insertNodes(_editor, _text)

  // apply all ranges as marks
  moveToStart(_editor)

  // blockData.ranges.forEach(range => applyRange(_editor, range))
  // console.log(_editor.children)
  blockData.ranges.reduce((acc, curr) => {
    // console.log('acc', JSON.stringify(acc.children))
    applyRange(acc, curr)
    // console.log('acc', JSON.stringify(acc.children))

    return acc
  }, _editor)

  // console.log('NEWEST ONE', JSON.stringify(__editor.children[0].children))

  const { children } = _editor.children[0]

  return children
}
