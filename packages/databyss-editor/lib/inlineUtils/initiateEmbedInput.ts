import { ReactEditor } from '@databyss-org/slate-react'
import { KeyboardEvent } from 'react'

import {
  Node,
  Range,
  Transforms,
  Editor as SlateEditor,
} from '@databyss-org/slate'
import { validURL } from '@databyss-org/services/lib/util'
import { flattenOffset, isCurrentlyInInlineAtomicField } from '../slateUtils'
import { InlineInitializer } from '.'
import { InlineTypes } from '@databyss-org/services/interfaces/Range'
import { inlineTypeToSymbol, inlineTypeToInputFieldRange } from './helpers'

/**
 *
 * @param param0 checks if `<<` has been entered and then initiates embed input
 */
export const initiateEmbedInput = ({
  editor,
  event,
  firstBlockIsTitle,
}: {
  editor: ReactEditor & SlateEditor
  event: KeyboardEvent
  firstBlockIsTitle: boolean
}): boolean => {
  if (!editor.selection) {
    return false
  }

  if (
    (event.key === '<' || event.key === '>') &&
    Range.isCollapsed(editor.selection)
  ) {
    const _inlineType = event.key === '<' ? InlineTypes.Embed : InlineTypes.Link
    // don't allow inline if we're in title block
    if (firstBlockIsTitle && editor.selection.focus.path[0] === 0) {
      return false
    }
    // check if its not at the start of a block
    let _offset: string | number = flattenOffset(
      editor,
      editor.selection.focus
    ).toString()

    // return if not <<
    _offset = parseInt(_offset, 10)

    if (_offset < 1) {
      return false
    }

    // make sure this isnt an atomic closure
    const _text = Node.string(editor.children[editor.selection.focus.path[0]])

    const _shouldInitiate =
      _text.charAt(_offset - 1) === '<' || _text.charAt(_offset - 1) === '>'

    if (_shouldInitiate) {
      // const _isClosure = _text.charAt(_offset - 1) === '/'

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
          const _wordToSwollow = _text.slice(_offset).split(/\s/)[0]

          // check if word is url
          const _isUrl = validURL(_wordToSwollow)

          // swollow word
          if (_isUrl) {
            // highligh next word and remove word
            Transforms.move(editor, {
              unit: 'character',
              distance: 1,
              edge: 'anchor',
              reverse: true,
            })

            Transforms.move(editor, {
              unit: 'character',
              distance: _wordToSwollow.length,
              edge: 'focus',
            })
            Transforms.delete(editor)
            Transforms.insertNodes(editor, {
              text: `${InlineInitializer.embed}${_wordToSwollow}`,
              inlineEmbedInput: true,
            })
            event.preventDefault()
            return true
          }
        }
      }
      // toggle the inline atomic block
      // insert key manually to trigger an 'insert_text' command
      if (!isCurrentlyInInlineAtomicField(editor)) {
        // remove previous `<` or `>`
        Transforms.move(editor, {
          unit: 'character',
          distance: 1,
          edge: 'anchor',
          reverse: true,
        })
        Transforms.delete(editor)

        Transforms.insertNodes(editor, {
          text: inlineTypeToSymbol(_inlineType),
          [inlineTypeToInputFieldRange(_inlineType)]: true,
        })
        event.preventDefault()
        return true
      }
    }
  }
  return false
}
