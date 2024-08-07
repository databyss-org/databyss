import { KeyboardEvent } from 'react'
import { Node, Transforms, Editor as SlateEditor } from '@databyss-org/slate'
import { ReactEditor } from '@databyss-org/slate-react'
import {
  slateSelectionToStateSelection,
  slateRangesToStateRanges,
} from '../slateUtils'
import { Block } from '../../../databyss-services/interfaces/Block'
import { EditorState } from '../../interfaces/EditorState'

export const onLinkBackspace = ({
  state,
  editor,
  event,
  setContent,
}: {
  state: EditorState
  editor: ReactEditor & SlateEditor
  event: KeyboardEvent
  currentBlock: Block
  setContent: Function
}): boolean => {
  if (event.key !== 'Backspace') {
    return false
  }
  if (!editor?.selection) {
    return false
  }

  const _currentLeaf = Node.leaf(editor, editor.selection.anchor.path)

  // check if page link is being deleted
  if (_currentLeaf.link) {
    if (_currentLeaf.text.length === 1) {
      event.preventDefault()
      Transforms.removeNodes(editor, {
        match: (node) => node === _currentLeaf,
      })
      const selection = slateSelectionToStateSelection(editor)

      const _index = state.selection.anchor.index
      setContent({
        selection,
        operations: [
          {
            index: _index,
            text: {
              textValue: Node.string(editor.children[_index]),
              ranges: slateRangesToStateRanges(editor.children[_index]),
            },
            checkAtomicDelta: true,
          },
        ],
      })

      return true
    }
  }

  return false
}
