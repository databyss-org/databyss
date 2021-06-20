import { ReactEditor } from '@databyss-org/slate-react'
import { Node, Editor as SlateEditor } from '@databyss-org/slate'
import Hotkeys from '../hotKeys'
import { getInlineOrAtomicsFromStateSelection } from '../../state/util'
import { EditorState } from '../../interfaces/EditorState'
import { toggleMark } from '../slateUtils'

/**
 * before toggling a range, make sure that no atomics are selected or we are not in an inlineAtomicMenu range
 */
export const preventMarksOnInline = ({
  editor,
  event,
  state,
}: {
  editor: ReactEditor & SlateEditor
  event: KeyboardEvent
  state: EditorState
}): boolean => {
  if (!editor?.selection) {
    return false
  }

  if (
    Hotkeys.isBold(event) ||
    Hotkeys.isItalic(event) ||
    Hotkeys.isLocation(event)
  ) {
    const _currentLeaf = Node.leaf(editor, editor.selection.focus.path)
    if (
      !(
        getInlineOrAtomicsFromStateSelection(state).length ||
        _currentLeaf.inlineAtomicMenu ||
        _currentLeaf.inlineEmbedInput ||
        _currentLeaf.inlineLinkInput
      )
    ) {
      if (Hotkeys.isBold(event)) {
        toggleMark(editor, 'bold')
        event.preventDefault()
        return true
      }

      if (Hotkeys.isItalic(event)) {
        toggleMark(editor, 'italic')
        event.preventDefault()
        return true
      }

      if (Hotkeys.isLocation(event)) {
        toggleMark(editor, 'location')

        event.preventDefault()
        return true
      }
    }
  }
  return false
}
