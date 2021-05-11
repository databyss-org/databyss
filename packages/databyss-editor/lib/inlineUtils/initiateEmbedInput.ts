import { ReactEditor } from '@databyss-org/slate-react'
import { KeyboardEvent } from 'react'

import {
  Node,
  Range,
  Transforms,
  Editor as SlateEditor,
} from '@databyss-org/slate'
import { flattenOffset, isCurrentlyInInlineAtomicField } from '../slateUtils'

const validURL = (str) => {
  const pattern = new RegExp(
    '^(https?:\\/\\/)?' + // protocol
      '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
      '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
      '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
      '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
      '(\\#[-a-z\\d_]*)?$',
    'i'
  ) // fragment locator
  return !!pattern.test(str)
}

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

  if (event.key === '<' && Range.isCollapsed(editor.selection)) {
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
    if (_offset < 2) {
      return false
    }

    // const _atBlockStart = _offset === 0
    // if (!_atBlockStart) {
    // make sure this isnt an atomic closure
    const _text = Node.string(editor.children[editor.selection.focus.path[0]])

    const _shouldInitiate = _text.charAt(_offset - 1) === '<'

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

        console.log(_nextCharIsWhitespace)
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
              text: `<<${_wordToSwollow}`,
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
        // remove previous `<`
        Transforms.move(editor, {
          unit: 'character',
          distance: 1,
          edge: 'anchor',
          reverse: true,
        })
        Transforms.delete(editor)

        Transforms.insertNodes(editor, {
          text: '<<',
          inlineEmbedInput: true,
        })
        event.preventDefault()
        return true
      }
    }
  }
  return false
}
