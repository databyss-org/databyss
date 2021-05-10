import { ReactEditor } from '@databyss-org/slate-react'
import { Editor as SlateEditor } from '@databyss-org/slate'
import { EditorState } from '../../interfaces/EditorState'

import { slateSelectionToStateSelection } from '../../lib/slateUtils'

export const setAtomicWithoutSuggestion = ({
  editor,
  state,
  setContent,
}: {
  editor: ReactEditor & SlateEditor
  state: EditorState
  setContent: Function
}) => {
  const _index = state.selection.anchor.index
  const _stateBlock = state.blocks[_index]
  // set the block with a re-render
  const selection = slateSelectionToStateSelection(editor)

  // preserve selection id from DB
  if (state.selection._id && selection) {
    selection._id = state.selection._id
  }

  setContent({
    selection,
    operations: [
      {
        index: _index,
        text: _stateBlock.text,
        convertInlineToAtomic: true,
      },
    ],
  })
}
