import { Node, Transforms, Editor } from 'slate'
import { flattenOffset } from './slateUtils'

export const replaceShortcut = (editor, event) => {
  if (event.key === '-') {
    // check for m-dash
    const _offset = flattenOffset(editor, editor.selection.focus)
    if (_offset > 0) {
      Transforms.move(editor, { distance: 1, edge: 'anchor', reverse: true })
      const _frag = Editor.fragment(editor, editor.selection)
      if (Node.string(_frag[0]) === '-') {
        // replace text with em dash
        Transforms.delete(editor, {
          distance: 1,
          unit: 'character',
          reverse: true,
        })
        Transforms.insertText(editor, '\u2014')
        Transforms.move(editor, {
          distance: 1,
          edge: 'anchor',
          reverse: true,
        })
        event.preventDefault()
      }
      Transforms.move(editor, { distance: 1, edge: 'anchor' })
    }
  }
}
