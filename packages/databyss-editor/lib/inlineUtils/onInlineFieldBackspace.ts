import { KeyboardEvent } from 'react'
import { Node, Transforms, Editor as SlateEditor } from '@databyss-org/slate'
import { ReactEditor } from '@databyss-org/slate-react'
import { flattenOffset, isCurrentlyInInlineAtomicField } from '../slateUtils'
import { Block } from '../../../databyss-services/interfaces/Block'
import { RangeType } from '../../../databyss-services/interfaces/Range'

export const onInlineFieldBackspace = ({
  editor,
  event,
  currentBlock,
}: {
  editor: ReactEditor & SlateEditor
  event: KeyboardEvent
  currentBlock: Block
}): boolean => {
  if (!editor?.selection) {
    return false
  }

  // check if `inlineAtomicMenu` is active and atomic symbol is going to be deleted, toggle mark and remove symbol
  const _text = Node.string(editor.children[editor.selection.focus.path[0]])
  const _offset = parseInt(
    flattenOffset(editor, editor.selection.focus).toString(),
    10
  )

  if (
    isCurrentlyInInlineAtomicField(editor) &&
    _offset !== 0 &&
    (_text.charAt(_offset - 1) === '#' || _text.charAt(_offset - 1) === '@')
  ) {
    const _currentLeaf = Node.leaf(editor, editor.selection.anchor.path)

    if (_currentLeaf.inlineAtomicMenu) {
      // remove entire inline node if only the atomic symbol exists
      if (_currentLeaf.text.length === 1) {
        Transforms.removeNodes(editor, {
          match: (node) => node === _currentLeaf,
        })
      } else {
        // check if this is the last character left in the inlineAtomicMenu range
        // find if offset is on the one character into a inlineAtomicMenu
        const _inlineAtomicMenuRangeOffset = currentBlock.text.ranges.filter(
          (r) => r.marks.includes(RangeType.InlineAtomicInput)
        )[0].offset

        if (_inlineAtomicMenuRangeOffset + 1 === _offset) {
          // if atomic symbol is being removed, remove inlineAtomic mark from leaf
          const _textToInsert = _currentLeaf.text.substring(1)
          Transforms.removeNodes(editor, {
            match: (node) => node === _currentLeaf,
          })

          Transforms.insertNodes(editor, {
            text: _textToInsert,
          })
          Transforms.move(editor, {
            unit: 'character',
            distance: _textToInsert.length,
            reverse: true,
          })
          event.preventDefault()
          return true
          // eslint-disable-next-line no-else-return
        } else {
          return false
        }
      }
    }
    event.preventDefault()
  }
  return false
}
