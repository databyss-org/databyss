import { ReactEditor } from '@databyss-org/slate-react'
import { KeyboardEvent } from 'react'

import {
  Node,
  Range,
  Transforms,
  Editor as SlateEditor,
} from '@databyss-org/slate'
import { flattenOffset, isCurrentlyInInlineAtomicField } from '../slateUtils'

export const initiateInlineMenu = ({
  editor,
  event,
}: {
  editor: ReactEditor & SlateEditor
  event: KeyboardEvent
}): boolean => {
  if (!editor.selection) {
    return false
  }

  if (
    (event.key === '#' || event.key === '@') &&
    Range.isCollapsed(editor.selection)
  ) {
    // check if its not at the start of a block
    let _offset: string | number = flattenOffset(
      editor,
      editor.selection.focus
    ).toString()

    _offset = parseInt(_offset, 10)
    const _atBlockStart = _offset === 0
    if (!_atBlockStart) {
      // make sure this isnt an atomic closure
      const _text = Node.string(editor.children[editor.selection.focus.path[0]])

      const _isClosure = _text.charAt(_offset - 1) === '/'

      const _atBlockEnd = _offset === _text.length
      // perform a lookahead to see if inline atomic should 'slurp' following word
      if (!_atBlockEnd) {
        const _text = Node.string(
          editor.children[editor.selection.focus.path[0]]
        )
        const _offset = parseInt(
          flattenOffset(editor, editor.selection.focus).toString(),
          10
        )

        const _nextCharIsWhitespace =
          _text.charAt(_offset) === ' ' || _text.charAt(_offset) === '\n'
        // if next character is not a whitespace, swollow next word into mark `inlineAtomicMenu`
        if (!_nextCharIsWhitespace && !isCurrentlyInInlineAtomicField(editor)) {
          // get length of text to swollow
          // get word to swollow divided by white space, comma or period
          const _wordToSwollow = _text
            .slice(_offset)
            .split(/\s|\.|,|;|:|"|\]/)[0]

          // highligh next word and remove word
          Transforms.move(editor, {
            unit: 'character',
            distance: _wordToSwollow.length,
            edge: 'focus',
          })
          Transforms.delete(editor)

          Transforms.insertNodes(editor, {
            text: `${event.key}${_wordToSwollow}`,
            inlineAtomicMenu: true,
          })

          event.preventDefault()
          return true
        }
      }

      // toggle the inline atomic block
      // insert key manually to trigger an 'insert_text' command
      if (!isCurrentlyInInlineAtomicField(editor) && !_isClosure) {
        Transforms.insertNodes(editor, {
          text: event.key,
          inlineAtomicMenu: true,
        })
        event.preventDefault()
        return true
      }
    }
  }
  return false
}
