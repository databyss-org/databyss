import {
  Text,
  Range,
  Editor as SlateEditor,
  Transforms,
} from '@databyss-org/slate'
import cloneDeep from 'clone-deep'
import { ReactEditor } from '@databyss-org/slate-react'
import insertTextAtOffset from '../clipboardUtils/insertTextAtOffset'
import { Block } from '../../interfaces'
import { flattenOffset } from '../slateUtils'
import { EditorState } from '../../interfaces/EditorState'
import { getLowestLeaf } from './onInlineKeyPress'

export const enterAtEndOfInlineAtomic = ({
  editor,
  event,
  currentLeaf,
  setContent,
  atBlockEnd,
  currentBlock,
  state,
}: {
  editor: ReactEditor & SlateEditor
  event: KeyboardEvent
  currentLeaf: Text
  setContent: Function
  atBlockEnd: boolean
  currentBlock: Block
  state: EditorState
}): boolean => {
  if (!editor.selection) {
    return false
  }

  const _offset = parseInt(
    flattenOffset(editor, editor.selection.focus).toString(),
    10
  )

  if (
    Range.isCollapsed(editor.selection) &&
    (currentLeaf.inlineTopic || currentLeaf.inlineCitation || currentLeaf.embed)
  ) {
    /**
     * check if enter at end of embed
     */

    let _textToInsert = atBlockEnd ? '\n\u2060' : '\n'
    // enter non width white space if enter at end of embed

    if (currentLeaf.embed) {
      _textToInsert = '\uFEFF'
      Transforms.move(editor, { distance: 1, edge: 'focus' })
      const _frag = SlateEditor.fragment(editor, editor.selection)
      const _leaf = getLowestLeaf(_frag)

      // if node has no text insert \n
      if (_leaf?.embed && !_leaf?.text.length) {
        _textToInsert = '\n'
      }
      // else add a non width white space (cursor is currently in active inline embed)
      Transforms.collapse(editor, { edge: 'anchor' })

      window.requestAnimationFrame(() => {
        Transforms.insertNodes(editor, { text: _textToInsert })
        Transforms.move(editor, { distance: 1, unit: 'character' })
      })

      event.preventDefault()
      return true
    }

    const { text, offsetAfterInsert } = insertTextAtOffset({
      text: currentBlock.text,
      offset: _offset,
      textToInsert: { textValue: _textToInsert, ranges: [] },
    })

    const _newBlock = {
      ...currentBlock,
      text,
    }
    //  update the selection
    const _sel = cloneDeep(state.selection)
    _sel.anchor.offset = offsetAfterInsert
    _sel.focus.offset = offsetAfterInsert

    setContent({
      selection: _sel,
      operations: [
        {
          index: editor.selection.focus.path[0],
          text: _newBlock.text,
          withRerender: true,
        },
      ],
    })
    event.preventDefault()
    return true
  }
  return false
}
