import React, { useMemo, useRef, useEffect, useImperativeHandle } from 'react'
import { createEditor, Node, Transforms, Point } from '@databyss-org/slate'
import { EM } from '@databyss-org/data/pouchdb/utils'
import { ReactEditor, withReact } from '@databyss-org/slate-react'
import { setSource } from '@databyss-org/services/sources'
import { setEmbed } from '@databyss-org/services/embeds'
import { setBlockRelations } from '@databyss-org/services/entries'
import { setTopic } from '@databyss-org/services/topics'
import { useNavigationContext } from '@databyss-org/ui/components/Navigation/NavigationProvider/NavigationProvider'
import { useEditorContext } from '../state/EditorProvider'
import Editor from './Editor'
import {
  stateToSlate,
  slateRangesToStateRanges,
  slateSelectionToStateSelection,
  stateSelectionToSlateSelection,
  flattenOffset,
  stateBlockToSlateBlock,
  isCharacterKeyPress,
  insertTextWithInilneCorrection,
  inlineAtomicBlockCorrector,
} from '../lib/slateUtils'
import { replaceShortcut } from '../lib/editorShortcuts'
import {
  getSelectedIndicies,
  isAtomic,
  isEmpty,
  isAtomicInlineType,
  cleanupAtomicData,
} from '../lib/util'
import Hotkeys, { isPrintable } from './../lib/hotKeys'
import { symbolToAtomicType, selectionHasRange } from '../state/util'
import { showAtomicModal } from '../lib/atomicModal'
import { isAtomicClosure } from './Element'
import { useHistoryContext } from '../history/EditorHistory'
import {
  onInlineFocusBlur,
  onInlineKeyPress,
  preventInlineAtomicCharacters,
  initiateInlineMenu,
  initiateEmbedInput,
  onInlineFieldBackspace,
  onEnterInlineField,
  onEscapeInInlineAtomicField,
  preventMarksOnInline,
  enterAtEndOfInlineAtomic,
} from '../lib/inlineUtils'

const ContentEditable = ({
  onDocumentChange,
  focusIndex,
  autofocus,
  readonly,
  onNavigateUpFromTop,
  editorRef,
  sharedWithGroups,
  firstBlockIsTitle,
}) => {
  const editorContext = useEditorContext()
  const navigationContext = useNavigationContext()

  const historyContext = useHistoryContext()

  const {
    state,
    split,
    merge,
    setContent,
    setSelection,
    clear,
    remove,
    removeAtSelection,
    removeEntityFromQueue,
    removeAtomicFromQueue,
  } = editorContext

  const editor = useMemo(() => withReact(createEditor()), [])
  const valueRef = useRef(null)
  const selectionRef = useRef(null)

  try {
    if (!valueRef.current || state.operations.reloadAll) {
      editor.children = stateToSlate(state)
      // load selection from DB
      if (state.selection) {
        const selection = stateSelectionToSlateSelection(
          editor.children,
          state.selection
        )

        Transforms.select(editor, selection)

        if (!state.operations.reloadAll) {
          setSelection(state.selection)
        }
      }
    }
  } catch (error) {
    // FIXME: handle selection failure, to prevent page from breaking on load
    console.warn(error)
  }

  // if atomics were removed from page, clear page from block relation
  useEffect(() => {
    state.removedEntities.forEach((e) => {
      removeAtomicFromQueue(e._id)
      const _payload = {
        operationType: 'REMOVE',
        type: e.type,
        _id: e._id,
        page: state.pageHeader?._id,
      }
      setBlockRelations(_payload)
    })
  }, [state.removedEntities])

  // if focus index is provides, move caret
  useEffect(() => {
    if (typeof focusIndex === 'number' && editor.children) {
      const _point = { index: focusIndex, offset: 0 }
      const _selection = { anchor: _point, focus: _point }
      const _slateSelection = stateSelectionToSlateSelection(
        editor.children,
        _selection
      )

      Transforms.select(editor, _slateSelection)
      // push selection to reducer
      setSelection(_selection)
    }
  }, [focusIndex])

  // if new atomic block has been added, save atomic
  useEffect(() => {
    const _process = async () => {
      // flush the queue processor in order to get up to date values
      await EM?.process()

      state.newEntities.forEach((entity) => {
        let _data = null
        // suggestion blocks have extra data

        if (entity.text) {
          _data = cleanupAtomicData({
            ...entity,
            sharedWithGroups,
            detail: entity?.detail,
          })
        }

        const _types = {
          SOURCE: () => {
            if (_data) {
              window.requestAnimationFrame(() => setSource(_data))
            }
          },
          TOPIC: () => {
            if (_data) {
              window.requestAnimationFrame(() => setTopic(_data))
            }
          },
          EMBED: () => {
            if (_data) {
              window.requestAnimationFrame(() => setEmbed(_data))
            }
          },
        }
        _types[entity.type]()

        // set BlockRelation property
        const _payload = {
          operationType: 'ADD',
          type: entity.type,
          _id: entity._id,
          page: state.pageHeader?._id,
        }
        setBlockRelations(_payload)
        removeEntityFromQueue(entity._id)
      })
    }
    if (state.newEntities.length) {
      _process()
    }
  }, [state.newEntities.length])

  useImperativeHandle(editorRef, () => ({
    focus: () => {
      ReactEditor.focus(editor)
      const _firstBlockText = state.blocks[0].text.textValue
      // if first block is empty, set selection at origin
      if (!_firstBlockText.length) {
        const _point = { index: 0, offset: 0 }
        const _sel = { focus: _point, anchor: _point }
        // preserve selection id from DB
        if (state.selection._id) {
          _sel._id = state.selection._id
        }
        setSelection(_sel)
      }
    },
  }))

  const inDeadKey = useRef(false)

  useEffect(() => {
    if (onDocumentChange) {
      onDocumentChange(editor)
    }
  }, [editor.operations, editor.children])

  /*
    this function must be outside of the useMemo in order to have up to date values
  */

  // onInlineAtomicClick will recieve outdated information, pass `editorContextRef` instead
  const editorContextRef = useRef({
    editorContext,
  })

  useEffect(() => {
    editorContextRef.current = {
      editorContext,
    }
  }, [state?.selection?.anchor.index])

  const onInlineAtomicClick = (inlineData) => {
    // pass editorContext
    const inlineAtomicData = {
      refId: inlineData.refId,
      type: inlineData.type,
    }
    const modalData = {
      editorContextRef,
      editorContext,
      editor,
      navigationContext,
      inlineAtomicData,
    }
    showAtomicModal(modalData)
  }

  return useMemo(() => {
    const onChange = (value) => {
      if (onDocumentChange) {
        onDocumentChange(editor)
      }
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
            textValue: Node.string(value[focusIndex]),
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
            textValue: Node.string(value[focusIndex]),
            ranges: slateRangesToStateRanges(value[focusIndex]),
          },
          previous: {
            textValue: Node.string(value[focusIndex - 1]),
            ranges: slateRangesToStateRanges(value[focusIndex - 1]),
          },
        })
        return
      }

      if (
        editor.operations.find(
          (op) =>
            (op.type === 'insert_text' ||
              op.type === 'insert_node' ||
              op.type === 'remove_text' ||
              op.type === 'remove_node') &&
            (op?.text?.length || op?.node?.text?.length)
        )
      ) {
        const _editorTextValue = Node.string(value[focusIndex])
        // skip setContent if text hasn't changed
        if (state.blocks[focusIndex].text.textValue === _editorTextValue) {
          return
        }
        // update target node
        setContent({
          selection,
          operations: [
            {
              ...payload,
              index: focusIndex,
              text: {
                textValue: _editorTextValue,
                ranges: slateRangesToStateRanges(value[focusIndex]),
              },
            },
          ],
        })
        return
      }

      // set_node is called on format change transforms
      if (editor.operations.find((op) => op.type === 'set_node')) {
        // get indexies of selected nodes
        const _blocksChanged = getSelectedIndicies(selection)

        const _operations = []
        _blocksChanged.forEach((idx) => {
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

      if (editor.operations.length) {
        setSelection(selection)
      }
    }

    const onKeyDown = (event) => {
      // if a character has been entered, check if the position needs to be corrected for inline atomics
      if (isCharacterKeyPress(event) || event.key === 'Backspace') {
        inlineAtomicBlockCorrector(event, editor)
      }

      const escapeInInlineAtomicField = onEscapeInInlineAtomicField({
        editor,
        event,
        state,
        setContent,
      })

      if (escapeInInlineAtomicField) {
        return
      }

      const _shouldReturn = onInlineFocusBlur({
        state,
        editor,
        event,
        setContent,
      })
      if (_shouldReturn) {
        return
      }

      const _isInlineBackspace = onInlineKeyPress({
        event,
        editor,
        state,
        setContent,
        onInlineAtomicClick,
      })
      if (_isInlineBackspace) {
        return
      }

      preventInlineAtomicCharacters(editor, event)

      if (Hotkeys.isUndo(event) && historyContext) {
        event.preventDefault()
        historyContext.undo()
        return
      }

      if (Hotkeys.isRedo(event) && historyContext) {
        event.preventDefault()
        historyContext.redo()
      }

      // UI
      if (event.key === 'ArrowUp') {
        const _currentIndex = editor.selection.focus.path[0]
        const _atBlockStart =
          editor.selection.focus.path[1] === 0 &&
          editor.selection.focus.offset === 0
        if (onNavigateUpFromTop && _atBlockStart && _currentIndex === 0) {
          onNavigateUpFromTop()
        }
      }
      // if diacritics has been toggled, set dead key
      if (event.key === 'Dead') {
        inDeadKey.current = true
      } else if (event.key !== 'Enter') {
        inDeadKey.current = false
      }

      // if diacritic is toggled and enter key is pressed, prevent default behavior
      if (inDeadKey.current && event.key === 'Enter') {
        inDeadKey.current = false
        event.preventDefault()
        return
      }

      // em dash shortcut
      replaceShortcut(editor, event)

      if (Hotkeys.isTab(event)) {
        event.preventDefault()
        insertTextWithInilneCorrection('\t', editor)
        return
      }

      const shouldPreventMarks = preventMarksOnInline({
        editor,
        event,
        state,
      })

      if (shouldPreventMarks) {
        return
      }

      // don't allow a printable key to "overwrite" a selection that spans multiple blocks
      if (
        isPrintable(event) &&
        editor.selection.focus.path[0] !== editor.selection.anchor.path[0]
      ) {
        event.preventDefault()
        return
      }

      // check for embeds
      const shouldInitiateEmbed = initiateEmbedInput({
        editor,
        event,
        firstBlockIsTitle,
      })
      if (shouldInitiateEmbed) {
        return
      }

      // check for inline atomics
      const shouldInitiateMenu = initiateInlineMenu({
        editor,
        event,
        firstBlockIsTitle,
      })
      if (shouldInitiateMenu) {
        return
      }

      if (event.key === 'Enter') {
        // carriage return in title advances selection to next line
        if (firstBlockIsTitle) {
          if (editor.selection.focus.path[0] === 0) {
            event.preventDefault()
            Transforms.move(editor, { unit: 'line', distance: 1 })
            return
          }
        }

        const _focusedBlock = state.blocks[editor.selection.focus.path[0]]
        const _currentLeaf = Node.leaf(editor, editor.selection.focus.path)

        const isCurrentlyInInlineAtomicField = onEnterInlineField({
          event,
          currentLeaf: _currentLeaf,
          state,
          setContent,
          editor,
        })
        if (isCurrentlyInInlineAtomicField) {
          return
        }

        if (isAtomic(_focusedBlock)) {
          if (
            ReactEditor.isFocused(editor) &&
            !selectionHasRange(state.selection) &&
            _focusedBlock.__isActive &&
            !isAtomicClosure(_focusedBlock.type)
          ) {
            event.preventDefault()
            showAtomicModal({ editorContext, navigationContext, editor })
          }
          // if closure block is highlighted prevent `enter` key
          if (_focusedBlock.__isActive && isAtomicClosure(_focusedBlock.type)) {
            event.preventDefault()
          }

          return
        }
        const _text = Node.string(
          editor.children[editor.selection.focus.path[0]]
        )
        const _offset = parseInt(
          flattenOffset(editor, editor.selection.focus),
          10
        )
        const _prevIsBreak = _text.charAt(_offset - 1) === '\n'
        const _prevIsDoubleBreak =
          _prevIsBreak &&
          (_offset - 2 <= 0 || _text.charAt(_offset - 2) === '\n')
        const _nextIsBreak = _text.charAt(_offset) === '\n'
        const _nextIsDoubleBreak =
          _nextIsBreak && _text.charAt(_offset + 1) === '\n'
        const _atBlockStart = _offset === 0
        const _atBlockEnd = _offset === _text.length
        const _doubleLineBreak =
          (_atBlockEnd && _prevIsBreak) ||
          (_atBlockStart && _nextIsBreak) ||
          (_prevIsBreak && _nextIsBreak) ||
          _nextIsDoubleBreak ||
          _prevIsDoubleBreak ||
          _text.length === 0

        if (!_doubleLineBreak && !symbolToAtomicType(_text.charAt(0))) {
          // // edge case where enter is at the end of an inline atomic
          const isEnterAtEndOfInlineAtomic = enterAtEndOfInlineAtomic({
            editor,
            event,
            currentLeaf: _currentLeaf,
            setContent,
            atBlockEnd: _atBlockEnd,
            currentBlock: _focusedBlock,
            state,
          })
          if (isEnterAtEndOfInlineAtomic) {
            return
          }

          // we're not creating a new block, so just insert a carriage return
          event.preventDefault()

          const _isNextCharNewLine = _text.charAt(_offset) === '\n'
          if (!_isNextCharNewLine) {
            // inserts the text without markup
            Transforms.insertNodes(editor, { text: '\n' })
          } else {
            Transforms.insertText(editor, '\n')
          }

          return
        }
        // if next character is a line break force the cursor down one position
        if (_nextIsBreak && _text.length - 1 === _offset) {
          event.preventDefault()
          Transforms.move(editor, { unit: 'character', distance: 1 })
          return
        }

        return
      }
      if (event.key === 'Backspace') {
        // if there is a selection, handle the delete operation in our state
        if (!Point.equals(editor.selection.focus, editor.selection.anchor)) {
          event.preventDefault()
          removeAtSelection()
          return
        }

        // handle start of atomic
        if (
          editor.selection.focus.path[0] > 0 &&
          isAtomic(state.blocks[editor.selection.focus.path[0]]) &&
          flattenOffset(editor, editor.selection.focus) === 0 &&
          isEmpty(state.blocks[editor.selection.focus.path[0] - 1])
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
        const _currentBlock = state.blocks[editor.selection.focus.path[0]]

        if (
          isAtomic(_currentBlock) &&
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
          isAtomic(state.blocks[editor.selection.focus.path[0] - 1]) &&
          isEmpty(state.blocks[editor.selection.focus.path[0]])
        ) {
          event.preventDefault()
          remove(editor.selection.focus.path[0])
          Transforms.delete(editor, {
            distance: 1,
            unit: 'character',
            reverse: true,
          })
        }

        const _currentIndex = editor.selection.focus.path[0]
        // if current offset is zero and previous or current block is atomic, move selection back one space
        const _mergingIntoAtomic = isAtomicInlineType(
          state.blocks[_currentIndex - 1]?.type
        )
        const _mergingAtomic = isAtomicInlineType(
          state.blocks[_currentIndex].type
        )
        if (
          (_mergingIntoAtomic || _mergingAtomic) &&
          flattenOffset(editor, editor.selection.focus) === 0
        ) {
          event.preventDefault()
          Transforms.move(editor, {
            unit: 'character',
            distance: 1,
            reverse: true,
          })
        }

        const currentBlock = state.blocks[_currentIndex]

        onInlineFieldBackspace({ editor, event, currentBlock })
      }
    }

    if (state.preventDefault) {
      editor.children = valueRef.current
      editor.selection = selectionRef.current
    }

    // store selection because the Transforms below move it around
    let nextSelection = editor.selection

    state.operations.forEach((op) => {
      const _block = stateBlockToSlateBlock(op.block)
      // if new block was added in reducer
      if (!editor.children[op.index]) {
        Transforms.insertNodes(
          editor,
          { children: [], type: 'ENTRY', isBlock: true },
          { at: [op.index] }
        )
      }
      if (op.insertBefore) {
        Transforms.insertNodes(editor, [_block], {
          at: [op.index],
        })
      } else {
        // clear current block
        editor.children[op.index].children.forEach(() => {
          Transforms.delete(editor, { at: [op.index, 0] })
        })
        // set block type
        Transforms.setNodes(
          editor,
          { type: _block.type },
          {
            at: [op.index],
          }
        )
        // inserts node

        Transforms.insertFragment(editor, [_block], {
          at: [op.index],
        })
        // embedded media requires a nbsp, editor should move caret forward one position
        if (op.setCaretAfter) {
          window.requestAnimationFrame(() => {
            Transforms.insertNodes(editor, {
              text: '\n',
            })
          })
        }
      }
      // if reducer states to set the selection as an operation, perform seletion
      if (op.setSelection) {
        ReactEditor.focus(editor)

        const _sel = stateSelectionToSlateSelection(
          editor.children,
          state.selection
        )

        window.requestAnimationFrame(() => {
          Transforms.select(editor, _sel)
        })
      }
    })

    // if there were any update operations,
    //   sync the Slate selection to the state selection
    if (state.operations.length) {
      nextSelection = stateSelectionToSlateSelection(
        editor.children,
        state.selection
      )
    }

    valueRef.current = editor.children

    selectionRef.current = nextSelection

    if (state.preventDefault) {
      editor.operations = []
    }
    /*
if focus event is fired and editor.selection is null, set focus at origin. this is used when editorRef.focus() is called by a parent component
*/
    const onFocus = () => {
      setTimeout(() => {
        if (!editor.selection) {
          const _selection = {
            anchor: { index: 0, offset: 0 },
            focus: { index: 0, offset: 0 },
          }
          const _slateSelection = stateSelectionToSlateSelection(
            editor.children,
            _selection
          )

          Transforms.select(editor, _slateSelection)
          ReactEditor.focus(editor)
        }
      }, 5)
    }

    return (
      <Editor
        onInlineAtomicClick={onInlineAtomicClick}
        editor={editor}
        onFocus={onFocus}
        autofocus={autofocus}
        value={editor.children}
        selection={nextSelection}
        onChange={onChange}
        onKeyDown={onKeyDown}
        readonly={readonly}
        firstBlockIsTitle={firstBlockIsTitle}
      />
    )
  }, [editor, state])
}

export default ContentEditable
