import { KeyboardEvent } from 'react'
import { ReactEditor } from '@databyss-org/slate-react'
import {
  Node,
  Transforms,
  Range,
  Editor as SlateEditor,
  Element,
  Descendant,
} from '@databyss-org/slate'
import {
  isCharacterKeyPress,
  slateSelectionToStateSelection,
  slateRangesToStateRanges,
} from '../slateUtils'
import { EditorState } from '../../interfaces/EditorState'
import { symbolToAtomicType } from '../../state/util'
import { BlockType } from '../../../databyss-services/interfaces/Block'

export const getLowestLeaf = (children: Descendant[]) => {
  if (children?.length === 1) {
    const _child = children[0] as Element
    if (_child?.children) {
      const _firstChild = _child.children[0]
      if (_firstChild) {
        return getLowestLeaf([_firstChild])
      }
    }
    return _child
  }
  return null
}

export const onInlineKeyPress = ({
  event,
  editor,
  state,
  setContent,
  onInlineAtomicClick,
}: {
  onInlineAtomicClick: Function
  setContent: Function
  event: KeyboardEvent
  editor: ReactEditor & SlateEditor
  state: EditorState
}): boolean => {
  // never allow inline atomics to be entered manually
  if (!editor.selection) {
    return false
  }

  let _embedEdgeCase = false
  if (event.key === 'Enter') {
    /**
     * edge case: check if next leaf is an embed and offset is and the end of current leaf. if so, jog editor forward and back one
     */
    const _currentLeaf = Node.leaf(editor, editor.selection.focus.path)
    const _anchor = editor.selection.anchor

    const _isAnchorAtEndOfLeaf = _currentLeaf.text.length === _anchor.offset
    if (_isAnchorAtEndOfLeaf) {
      const _next = SlateEditor.next(editor)
      if (_next?.[0]?.embed) {
        _embedEdgeCase = true
        Transforms.move(editor, {
          unit: 'character',
          distance: 1,
        })
        Transforms.move(editor, {
          unit: 'character',
          distance: 1,
          reverse: true,
        })
      }
    }
  }

  if (
    (isCharacterKeyPress(event) || event.key === 'Backspace') &&
    (SlateEditor.marks(editor)?.inlineTopic ||
      SlateEditor.marks(editor)?.inlineCitation ||
      SlateEditor.marks(editor)?.embed ||
      _embedEdgeCase) &&
    Range.isCollapsed(editor.selection)
  ) {
    const _currentBlock = state.blocks[state.selection.anchor.index]
    let _currentLeaf = Node.leaf(editor, editor.selection.focus.path)
    const _anchor = editor.selection.anchor
    const _isAnchorAtStartOfLeaf =
      _anchor.offset === 0 &&
      (_anchor.path[1] !== 0 ||
        _currentBlock.text.textValue.length === _currentLeaf.text.length)
    const _isAnchorAtEndOfLeaf = _currentLeaf.text.length === _anchor.offset

    if (_isAnchorAtStartOfLeaf && !_embedEdgeCase) {
      // jog the caret back and forward to reset current leaf
      // current leaf will assume the end of last leaf
      Transforms.move(editor, {
        unit: 'character',
        distance: 1,
        reverse: true,
      })
      Transforms.move(editor, {
        unit: 'character',
        distance: 1,
      })
      _currentLeaf = Node.leaf(editor, editor.selection.anchor.path)
    }
    // if current or prevous leaf is inline
    if (
      _currentLeaf.inlineTopic ||
      _currentLeaf.inlineCitation ||
      _currentLeaf.embed
    ) {
      // if not backspace event and caret was at the start or end of leaf, remove mark and allow character to pass through
      if (
        !(_isAnchorAtStartOfLeaf || _isAnchorAtEndOfLeaf) ||
        event.key === 'Backspace' ||
        _embedEdgeCase
      ) {
        /*
          remove entire inline atomic, check page to see if its the last one, if so, remove from page
          */
        if (event.key === 'Backspace') {
          // remove inline node

          /**
           * if anchor is at end of embed leaf
           * check if next node is a non-width white space
           * if so, remove white space and move anchor back one
           */
          if (_currentLeaf.embed) {
            // move forward one and check selection
            Transforms.move(editor, {
              distance: 1,
              edge: 'focus',
              reverse: true,
            })
            const _frag = SlateEditor.fragment(editor, editor.selection)
            const _leaf = getLowestLeaf(_frag)
            if (_leaf?.embed) {
              // check if text is empty
              if (!_leaf?.text?.length) {
                // if node is empty and embed, remove node instead
                Transforms.removeNodes(editor, {
                  match: (node) => node === _leaf,
                })
                // move cursor back one space
                Transforms.move(editor, {
                  distance: 1,
                  reverse: true,
                  unit: 'character',
                })

                event.preventDefault()
                return true
              }
            }

            Transforms.collapse(editor, { edge: 'anchor' })
          }

          Transforms.removeNodes(editor, {
            match: (node) => node === _currentLeaf,
          })

          const _index = state.selection.anchor.index
          const selection = {
            ...slateSelectionToStateSelection(editor),
            _id: state.selection._id,
          }

          // set the block with a re-render
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

          event.preventDefault()
          return true
        }

        /*
          if cursor is on an inline atomic and enter is pressed, launch modal
          */
        if (event.key === 'Enter') {
          const _type: string | BlockType = symbolToAtomicType(
            _currentLeaf.text.substring(0, 1)
          )

          // check if inline embed
          if (_currentLeaf?.embed) {
            // if enter, move cursor to end of current leaf
            const _leafOffset = _anchor.offset
            Transforms.move(editor, {
              distance: _currentLeaf.text.length - _leafOffset,
              unit: 'character',
            })

            Transforms.insertNodes(editor, { text: '\n' })
            event.preventDefault()

            return true
          }
          const inlineAtomicData = {
            id: _currentLeaf.atomicId,
            atomicType: _type,
          }
          if (_currentLeaf.text.length === _anchor.offset) {
            Transforms.insertNodes(editor, { text: '\n' })
            event.preventDefault()
            return true
          }
          onInlineAtomicClick(inlineAtomicData)
        }
        event.preventDefault()

        return true
      }
    }
  }
  return false
}
