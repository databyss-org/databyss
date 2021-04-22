import { KeyboardEvent } from 'react'
import { ReactEditor } from 'slate-react'
import { Node, Transforms, Editor as SlateEditor } from '@databyss-org/slate'
import { EditorState } from '../../interfaces/EditorState'
import {
  isCurrentlyInInlineAtomicField,
  toggleMark,
  flattenOffset,
} from '../slateUtils'

/**
 *
 *  if cursor has blurred active inline atomic block, perform inline atomic action
 */

export const onInlineFocusBlur = ({
  setContent,
  state,
  editor,
  event,
}: {
  setContent: Function
  state: EditorState
  editor: ReactEditor
  event: KeyboardEvent
}): boolean | undefined => {
  // if a space or arrow right key is entered and were currently creating an inline atomic, pass through normal text and remove inline mark
  if (
    (event.key === ' ' || event.key === 'ArrowRight') &&
    isCurrentlyInInlineAtomicField(editor)
  ) {
    // check to see if were at the end of block
    let _offset: string | number = flattenOffset(
      editor,
      editor.selection.focus
    ).toString()

    _offset = parseInt(_offset, 10)

    const _text = Node.string(editor.children[editor.selection.focus.path[0]])

    const _atBlockEnd = _offset === _text.length

    const _currentLeaf = Node.leaf(editor, editor.selection.focus.path)

    // if only atomic symbol exists, remove mark
    if (_currentLeaf.inlineAtomicMenu && _currentLeaf.text.length === 1) {
      // remove inline mark
      Transforms.move(editor, {
        unit: 'character',
        distance: 1,
        reverse: true,
      })
      Transforms.move(editor, {
        unit: 'character',
        distance: 1,
        edge: 'focus',
      })
      // remove all active marks in current text
      const _activeMarks = SlateEditor.marks(editor)
      if (_activeMarks) {
        Object.keys(_activeMarks).forEach((m) => {
          toggleMark(editor, m)
        })
      }

      Transforms.collapse(editor, {
        edge: 'focus',
      })

      if (event.key === ' ') {
        Transforms.insertText(editor, event.key)
      }
      event.preventDefault()
      return true
    } else if (
      // INLINE REFACTOR

      _currentLeaf.inlineAtomicMenu &&
      _atBlockEnd &&
      event.key === 'ArrowRight'
    ) {
      // if caret is at the end of a block, convert current inlineAtomicMenu to an inline block
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
  }
  return false
}
