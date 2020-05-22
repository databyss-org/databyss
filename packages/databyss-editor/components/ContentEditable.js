import React, { useMemo, useRef, useEffect } from 'react'
import { createEditor, Node, Transforms, Point, Range } from 'slate'
import { ReactEditor, withReact } from 'slate-react'
import _ from 'lodash'
import { produce } from 'immer'
import { useSourceContext } from '@databyss-org/services/sources/SourceProvider'
import { useTopicContext } from '@databyss-org/services/topics/TopicProvider'
import { useNavigationContext } from '@databyss-org/ui/components/Navigation/NavigationProvider/NavigationProvider'
import { useEditorContext } from '../state/EditorProvider'
import Editor from './Editor'
import {
  stateToSlate,
  slateRangesToStateRanges,
  slateSelectionToStateSelection,
  stateSelectionToSlateSelection,
  flattenNode,
  flattenOffset,
  stateBlockToSlateBlock,
  toggleMark,
} from '../lib/slateUtils'
import { getSelectedIndicies } from '../lib/util'
import Hotkeys from './../lib/hotKeys'
import { symbolToAtomicType, selectionHasRange } from '../state/util'
import { showAtomicModal } from '../lib/atomicModal'

const ContentEditable = ({ onDocumentChange, autofocus }) => {
  const editorContext = useEditorContext()
  const navigationContext = useNavigationContext()
  const sourceContext = useSourceContext()
  const topicContext = useTopicContext()

  const {
    state,
    split,
    merge,
    setContent,
    setSelection,
    getEntityAtIndex,
    clear,
    remove,
    removeEntityFromQueue,
  } = editorContext

  const editor = useMemo(() => withReact(createEditor()), [])
  const valueRef = useRef(null)
  const selectionRef = useRef(null)

  useEffect(
    () => {
      if (onDocumentChange) {
        onDocumentChange(editor)
      }
    },
    [editor.operations]
  )

  if (!valueRef.current) {
    editor.children = stateToSlate(state)
    // load selection from DB
    if (state.selection) {
      editor.selection = stateSelectionToSlateSelection(
        editor.children,
        state.selection
      )
    }
  }

  // if new atomic block has been added, save atomic
  useEffect(
    () => {
      if (state.newEntities.length && sourceContext && topicContext) {
        const { setSource } = sourceContext
        const { setTopic } = topicContext

        state.newEntities.forEach(entity => {
          const _data = {
            _id: entity._id,
            text: {
              textValue: entity.text.textValue,
              ranges: entity.text.ranges,
            },
          }
          ;({
            SOURCE: () => {
              setSource(_data)
            },
            TOPIC: () => {
              setTopic(_data)
            },
          }[entity.type]())
          removeEntityFromQueue(entity._id)
        })
      }
    },
    [state.newEntities.length]
  )

  const onKeyDown = event => {
    if (Hotkeys.isBold(event)) {
      event.preventDefault()
      toggleMark(editor, 'bold')
      return
    }

    if (Hotkeys.isItalic(event)) {
      toggleMark(editor, 'italic')
      event.preventDefault()
      return
    }

    if (Hotkeys.isLocation(event)) {
      toggleMark(editor, 'location')
      event.preventDefault()
      return
    }

    if (event.key === 'Enter') {
      const _focusedBlock = state.blocks[editor.selection.focus.path[0]]
      const _focusedEntity = getEntityAtIndex(editor.selection.focus.path[0])

      if (_focusedEntity.isAtomic) {
        if (
          ReactEditor.isFocused(editor) &&
          !selectionHasRange(state.selection) &&
          _focusedBlock.__isActive
        ) {
          showAtomicModal({ editorContext, navigationContext, editor })
        }
        return
      }
      const _text = Node.string(editor.children[editor.selection.focus.path[0]])
      const _offset = flattenOffset(editor, editor.selection.focus)
      const _prevIsBreak = _text.charAt(_offset - 1) === `\n`
      const _nextIsBreak = _text.charAt(_offset) === `\n`
      const _atBlockStart =
        editor.selection.focus.path[1] === 0 &&
        editor.selection.focus.offset === 0
      const _doubleLineBreak = _nextIsBreak || _prevIsBreak || _atBlockStart
      if (!_doubleLineBreak && !symbolToAtomicType(_text.charAt(0))) {
        // we're not creating a new block, so just insert a carriage return
        event.preventDefault()
        Transforms.insertText(editor, `\n`)
        return
      }
      if (!_atBlockStart) {
        // remove the hanging `\n`
        Transforms.delete(editor, {
          distance: 1,
          unit: 'character',
          reverse: _prevIsBreak,
        })
      }
      return
    }
    if (event.key === 'Backspace') {
      // if we have text selected, handle this separately
      if (!Point.equals(editor.selection.focus, editor.selection.anchor)) {
        return
      }
      // handle start of atomic
      if (
        editor.selection.focus.path[0] > 0 &&
        getEntityAtIndex(editor.selection.focus.path[0]).isAtomic &&
        flattenOffset(editor, editor.selection.focus) === 0 &&
        getEntityAtIndex(editor.selection.focus.path[0] - 1).isEmpty
      ) {
        event.preventDefault()
        remove(editor.selection.focus.path[0] - 1)
        Transforms.delete(editor, {
          distance: 1,
          unit: 'character',
          reverse: true,
        })
        return
      }
      // handle end of atomic
      if (
        getEntityAtIndex(editor.selection.focus.path[0]).isAtomic &&
        flattenOffset(editor, editor.selection.focus) > 0
      ) {
        event.preventDefault()
        clear(editor.selection.focus.path[0])
        Transforms.delete(editor, {
          distance: 1,
          unit: 'character',
          reverse: true,
        })
        return
      }
      // handle after atomic
      if (
        editor.selection.focus.path[0] > 0 &&
        getEntityAtIndex(editor.selection.focus.path[0] - 1).isAtomic &&
        getEntityAtIndex(editor.selection.focus.path[0]).isEmpty
      ) {
        event.preventDefault()
        remove(editor.selection.focus.path[0])
        Transforms.delete(editor, {
          distance: 1,
          unit: 'character',
          reverse: true,
        })
      }
    }
  }

  const onChange = value => {
    const selection = slateSelectionToStateSelection(editor)

    if (!selection) {
      return
    }

    // preserve selection id from DB
    if (state.selection._id) {
      selection._id = state.selection._id
    }

    const focusIndex = selection.focus.index

    const payload = {
      selection,
    }

    if (value.length < valueRef.current.length) {
      // block was removed, so do a merge
      merge({
        ...payload,
        index: focusIndex,
        text: {
          textValue: flattenNode(value[focusIndex]),
          ranges: slateRangesToStateRanges(value[focusIndex]),
        },
        blockDelta: valueRef.current.length - value.length,
      })
      return
    }
    if (value.length > valueRef.current.length) {
      // block was added, so do a split
      split({
        ...payload,
        index: focusIndex - 1,
        text: {
          textValue: flattenNode(value[focusIndex]),
          ranges: slateRangesToStateRanges(value[focusIndex]),
        },
        previous: {
          textValue: flattenNode(value[focusIndex - 1]),
          ranges: slateRangesToStateRanges(value[focusIndex - 1]),
        },
      })
      return
    }

    if (
      editor.operations.find(
        op =>
          (op.type === 'insert_text' || op.type === 'remove_text') &&
          op.text.length
      )
    ) {
      // update target node
      setContent({
        selection,
        operations: [
          {
            ...payload,
            index: focusIndex,
            text: {
              textValue: Node.string(value[focusIndex]),
              ranges: slateRangesToStateRanges(value[focusIndex]),
            },
          },
        ],
      })
      return
    }

    // set_node is called on format change transforms
    if (editor.operations.find(op => op.type === 'set_node')) {
      // get indexies of selected nodes
      const _blocksChanged = getSelectedIndicies(selection)

      const _operations = []
      _blocksChanged.forEach(idx => {
        // node should not be updated if a toggle mark occured
        if (Node.string(value[idx])) {
          // push operation to array
          _operations.push({
            ...payload,
            index: idx,
            text: {
              textValue: Node.string(value[idx]),
              ranges: slateRangesToStateRanges(value[idx]),
            },
          })
          setContent({ selection, operations: _operations })
          /* eslint-disable-next-line no-useless-return */
          return
        }
      })
    }

    setSelection(selection)
  }

  // Use immer to produce the next `value`
  //   we loop through the operations in `state` and updating nodes in `value`
  // if `state.preventDefault` is set, use the previous `value` as the
  //   base for the `nextValue` instead of `editor.children`
  const nextValue = produce(
    state.preventDefault ? valueRef.current : editor.children,
    draft => {
      state.operations.forEach(op => {
        const _block = stateBlockToSlateBlock(op.block)
        draft[op.index].children = _block.children
        draft[op.index].type = _block.type
        draft[op.index].isBlock = _block.isBlock
      })
    }
  )

  // by default, let selection remain uncontrolled
  // NOTE: preventDefault will rollback selection to that of previous render
  let nextSelection = state.preventDefault
    ? selectionRef.current
    : editor.selection

  // if there were any update operations,
  //   sync the Slate selection to the state selection
  if (state.operations.length) {
    nextSelection = stateSelectionToSlateSelection(nextValue, state.selection)
  }

  if (!_.isEqual(editor.selection, nextSelection)) {
    Transforms.setSelection(editor, nextSelection)
    // HACK only needs to be applied when editor is focused and Range is expanded (applying formats and marks)
    if (editor.selection && Range.isExpanded(editor.selection)) {
      // HACK:
      // There is a bug in Slate that causes unexpected behavior when creating a
      // selection by doing `Transforms.move` on the anchor and focus. If the
      // selection falls on a range that already has a mark, the focus gets the
      // correct path (pointing within the mark leaf) but the anchor gets the parent
      // path. The fix for this is to overshoot the anchor by 1
      // and then correct the offset with an additional move.

      Transforms.move(editor, { distance: 1, edge: 'anchor' })
      Transforms.move(editor, { distance: 1, edge: 'anchor', reverse: true })
    }
  }

  valueRef.current = nextValue
  selectionRef.current = nextSelection

  if (state.preventDefault) {
    editor.operations = []
  }

  return (
    <Editor
      editor={editor}
      autofocus={autofocus}
      value={nextValue}
      onChange={onChange}
      onKeyDown={onKeyDown}
    />
  )
}

export default ContentEditable
