import { ReactEditor } from '@databyss-org/slate-react'
import { Editor as SlateEditor } from '@databyss-org/slate'
import { isCurrentlyInInlineAtomicField } from '../slateUtils'
import { EditorState } from '../../interfaces/EditorState'
import { RangeType } from '../../../databyss-services/interfaces/Range'

/**
 * if inline menu is open, escape key should not bake inine and remove rang
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
  if (event.key === 'Escape' && isCurrentlyInInlineAtomicField(editor)) {
    const _index = state.selection.anchor.index
    const _stateBlock = state.blocks[_index]
    const _newRanges = _stateBlock.text.ranges.filter(
      (r) => !r.marks.includes(RangeType.InlineAtomicInput)
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
    return true
  }
  return false
}
