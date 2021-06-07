import { KeyboardEvent } from 'react'
import { ReactEditor } from '@databyss-org/slate-react'
import { Text } from '@databyss-org/slate'
import {
  isCurrentlyInInlineAtomicField,
  isCurrentlyInInlineEmbedInput,
} from '../slateUtils'
import { EditorState } from '../../interfaces/EditorState'

export const onEnterInlineField = ({
  event,
  currentLeaf,
  editor,
  state,
  setContent,
}: {
  event: KeyboardEvent
  currentLeaf: Text
  editor: ReactEditor
  state: EditorState
  setContent: Function
}): boolean => {
  if (
    isCurrentlyInInlineAtomicField(editor) ||
    isCurrentlyInInlineEmbedInput(editor)
  ) {
    // let suggest menu handle event if caret is inside of a new active inline atomic and currentLeaf has more than one character

    // if only one character is within the inline range, remove mark from character
    if (currentLeaf.text.length === 1) {
      const _index = state.selection.anchor.index
      const _stateBlock = state.blocks[_index]
      // set the block with a re-render
      setContent({
        selection: state.selection,
        operations: [
          {
            index: _index,
            text: _stateBlock.text,
            convertInlineToAtomic: true,
          },
        ],
      })
    }

    // if two characters exist, check if on an embed input
    if (currentLeaf.text.length === 2 && !currentLeaf?.inlineAtomicMenu) {
      const _index = state.selection.anchor.index
      const _stateBlock = state.blocks[_index]
      // set the block with a re-render
      setContent({
        selection: state.selection,
        operations: [
          {
            index: _index,
            text: _stateBlock.text,
            convertInlineToAtomic: true,
          },
        ],
      })
    }
    event.preventDefault()
    return true
  }

  return false
}
