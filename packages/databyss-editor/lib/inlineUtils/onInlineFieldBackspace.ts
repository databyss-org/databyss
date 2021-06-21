import { KeyboardEvent } from 'react'
import { Node, Transforms, Editor as SlateEditor } from '@databyss-org/slate'
import { ReactEditor } from '@databyss-org/slate-react'
import {
  flattenOffset,
  isCurrentlyInInlineAtomicField,
  stateSelectionToSlateSelection,
} from '../slateUtils'
import { Block } from '../../../databyss-services/interfaces/Block'
import { RangeType } from '../../../databyss-services/interfaces/Range'
import { InlineInitializer } from '.'

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

  // check for inline atomics fields
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

  const _currentLeaf = Node.leaf(editor, editor.selection.anchor.path)

  if (
    // check for inline embed fields
    _currentLeaf.inlineEmbedInput
  ) {
    // only << exist, remove mark on backspace
    if (
      _currentLeaf.inlineEmbedInput &&
      _currentLeaf.text === InlineInitializer.embed
    ) {
      Transforms.delete(editor, {
        distance: 1,
        unit: 'character',
        reverse: true,
      })
      Transforms.move(editor, {
        unit: 'character',
        distance: 1,
        edge: 'anchor',
        reverse: _offset !== 1,
      })
      SlateEditor.removeMark(editor, RangeType.InlineEmbedInput)
      Transforms.collapse(editor, {
        edge: _offset === 1 ? 'anchor' : 'focus',
      })

      event.preventDefault()
      return true
    }
    //  check if offset falls within the first two characters of range inlineEmbedInput
    const _inlineEmbedOffset = currentBlock.text.ranges.filter((r) =>
      r.marks.includes(RangeType.InlineEmbedInput)
    )[0].offset

    if (
      _inlineEmbedOffset + 1 === _offset ||
      _inlineEmbedOffset + 2 === _offset
    ) {
      // remove inline embed range and allow backspace
      Transforms.removeNodes(editor, {
        match: (node) => node === _currentLeaf,
      })
      Transforms.insertText(editor, _currentLeaf.text.substring(1))

      const point = {
        index: editor.selection.focus.path[0],
        offset: _offset - 1,
      }
      const _sel = stateSelectionToSlateSelection(editor.children, {
        anchor: point,
        focus: point,
      })
      Transforms.select(editor, _sel)
      event.preventDefault()
      return true
    }
  }

  if (
    // check for inline embed fields
    _currentLeaf.inlineLinkInput
  ) {
    // only << exist, remove mark on backspace
    if (_currentLeaf.text === InlineInitializer.link) {
      Transforms.delete(editor, {
        distance: 1,
        unit: 'character',
        reverse: true,
      })
      Transforms.move(editor, {
        unit: 'character',
        distance: 1,
        edge: 'anchor',
        reverse: _offset !== 1,
      })
      SlateEditor.removeMark(editor, RangeType.InlineLinkInput)
      Transforms.collapse(editor, {
        edge: _offset === 1 ? 'anchor' : 'focus',
      })

      event.preventDefault()
      return true
    }
    //  check if offset falls within the first two characters of range inlineEmbedInput
    const _inlineLinkInput = currentBlock.text.ranges.filter((r) =>
      r.marks.includes(RangeType.InlineLinkInput)
    )[0].offset

    if (_inlineLinkInput + 1 === _offset || _inlineLinkInput + 2 === _offset) {
      // remove inline embed range and allow backspace
      Transforms.removeNodes(editor, {
        match: (node) => node === _currentLeaf,
      })
      Transforms.insertText(editor, _currentLeaf.text.substring(1))

      const point = {
        index: editor.selection.focus.path[0],
        offset: _offset - 1,
      }
      const _sel = stateSelectionToSlateSelection(editor.children, {
        anchor: point,
        focus: point,
      })
      Transforms.select(editor, _sel)
      event.preventDefault()
      return true
    }
  }

  return false
}
