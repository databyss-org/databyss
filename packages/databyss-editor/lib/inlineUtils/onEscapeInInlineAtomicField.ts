import { ReactEditor } from '@databyss-org/slate-react'
import { Editor as SlateEditor } from '@databyss-org/slate'
import {
  isCurrentlyInInlineAtomicField,
  isCurrentlyInInlineEmbedInput,
} from '../slateUtils'
import { EditorState } from '../../interfaces/EditorState'
import { RangeType } from '../../../databyss-services/interfaces/Range'

export const removeCurrentInlineInput = ({
  state,
  setContent,
}: {
  state: EditorState
  setContent: Function
}) => {
  const _index = state.selection.anchor.index
  const _stateBlock = state.blocks[_index]
  const _newRanges = _stateBlock.text.ranges.filter(
    (r) =>
      !(
        r.marks.includes(RangeType.InlineAtomicInput) ||
        r.marks.includes(RangeType.InlineEmbedInput)
      )
  )

  // set the block with a re-render
  setContent({
    selection: state.selection,
    operations: [
      {
        index: _index,
        text: {
          textValue: _stateBlock.text.textValue,
          ranges: _newRanges,
        },
        withRerender: true,
      },
    ],
  })
}

/**
 * if inline menu is open, escape key should not bake inine and remove range
 */
export const onEscapeInInlineAtomicField = ({
  editor,
  event,
  state,
  setContent,
}: {
  editor: ReactEditor & SlateEditor
  event: KeyboardEvent
  state: EditorState
  setContent: Function
}): boolean => {
  if (
    event.key === 'Escape' &&
    (isCurrentlyInInlineAtomicField(editor) ||
      isCurrentlyInInlineEmbedInput(editor))
  ) {
    removeCurrentInlineInput({ state, setContent })
    return true
  }
  return false
}
