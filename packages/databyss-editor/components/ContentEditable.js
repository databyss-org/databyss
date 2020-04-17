import React, { useMemo, useRef } from 'react'
import { createEditor, Node, Transforms, Point } from 'slate'
import { withReact } from 'slate-react'
import { produce } from 'immer'
import { useEditorContext } from '../state/EditorProvider'
import Editor from './Editor'
import {
  stateToSlate,
  getRangesFromSlate,
  slateSelectionToStateSelection,
  stateSelectionToSlateSelection,
  flattenNode,
  flattenOffset,
  stateBlockToSlateBlock,
} from '../lib/slateUtils'
import { symbolToAtomicType } from '../state/util'

const ContentEditable = () => {
  const {
    state,
    split,
    merge,
    setContent,
    setSelection,
    getEntityAtIndex,
    clear,
    remove,
  } = useEditorContext()

  const editor = useMemo(() => withReact(createEditor()), [])
  const valueRef = useRef(null)
  const selectionRef = useRef(null)

  if (!valueRef.current) {
    editor.children = stateToSlate(state)
  }

  const onKeyDown = event => {
    if (event.key === 'Enter') {
      if (getEntityAtIndex(editor.selection.focus.path[0]).isAtomic) {
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
          ranges: getRangesFromSlate(value[focusIndex]),
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
          ranges: getRangesFromSlate(value[focusIndex]),
        },
        previous: {
          textValue: flattenNode(value[focusIndex - 1]),
          ranges: getRangesFromSlate(value[focusIndex - 1]),
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
        ...payload,
        index: focusIndex,
        text: {
          textValue: Node.string(value[focusIndex]),
          ranges: getRangesFromSlate(value[focusIndex]),
        },
      })
      return
    }
    // else just update selection
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
        draft[op.index].isActive = _block.isActive
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

  valueRef.current = nextValue
  selectionRef.current = nextSelection

  if (state.preventDefault) {
    console.log('preventDefault')
    editor.operations = []
  }

  return (
    <Editor
      editor={editor}
      value={nextValue}
      selection={nextSelection}
      onChange={onChange}
      onKeyDown={onKeyDown}
    />
  )
}

export default ContentEditable
