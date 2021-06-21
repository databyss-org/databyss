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

export const enterAtEndOfInlineAtomic = ({
  editor,
  event,
  currentLeaf,
  setContent,
  currentBlock,
  atBlockEnd,
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

    const _textToInsert = atBlockEnd ? '\n\u2060' : '\n'
    // enter non width white space if enter at end of embed

    let updateSelection = true
    if (currentLeaf.embed) {
      updateSelection = false

      window.requestAnimationFrame(() => {
        // jog selection back one and forward one to force selection to be within range
        Transforms.move(editor, {
          distance: 1,
          unit: 'character',
          reverse: true,
        })
        Transforms.move(editor, {
          distance: 1,
          unit: 'character',
        })

        const _nextNodePath = SlateEditor.next(editor, {
          at: editor.selection?.anchor,
        })
        // EDGE CASE: if cursor is at last position at the end of an embed, caret must be explicitly set
        if (_nextNodePath?.length) {
          const _textNode = _nextNodePath[0] as Text
          const _newOffset = _textNode.text.length
          const _newPath = _nextNodePath[1]
          const _point = { path: _newPath, offset: _newOffset }
          const _sel = { anchor: _point, focus: _point }
          Transforms.select(editor, _sel)
        }
      })
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
    if (updateSelection) {
      _sel.anchor.offset = offsetAfterInsert
      _sel.focus.offset = offsetAfterInsert
    }

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
