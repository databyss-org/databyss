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

  if (currentLeaf.embed) {
    event.preventDefault()
    Transforms.select(editor, {
      path: editor.selection!.focus.path,
      offset: currentLeaf.text.length,
    })
    requestAnimationFrame(() => {
      Transforms.insertNodes(editor, { text: '\n' })
    })
    return true
  }

  if (
    Range.isCollapsed(editor.selection) &&
    (currentLeaf.inlineTopic || currentLeaf.inlineCitation)
  ) {
    const _textToInsert = atBlockEnd ? '\n\u2060' : '\n'
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
