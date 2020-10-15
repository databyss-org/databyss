import React, { useMemo, useRef, useEffect, useImperativeHandle } from 'react'
import {
  createEditor,
  Node,
  Transforms,
  Point,
  Editor as SlateEditor,
} from '@databyss-org/slate'
import { ReactEditor, withReact } from '@databyss-org/slate-react'
import cloneDeep from 'clone-deep'
import { usePageContext } from '@databyss-org/services/pages/PageProvider'
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
  flattenOffset,
  stateBlockToSlateBlock,
  toggleMark,
  isMarkActive,
} from '../lib/slateUtils'
import { replaceShortcut } from '../lib/editorShortcuts'
import {
  getSelectedIndicies,
  isAtomic,
  isEmpty,
  isAtomicInlineType,
} from '../lib/util'
import Hotkeys, { isPrintable } from './../lib/hotKeys'
import { symbolToAtomicType, selectionHasRange } from '../state/util'
import { showAtomicModal } from '../lib/atomicModal'
import { isAtomicClosure } from './Element'
import { useHistoryContext } from '../history/EditorHistory'
import insertTextAtOffset from '../lib/clipboardUtils/insertTextAtOffset'

const firefoxWhitespaceFix = editor => {
  // pressed key is a char
  const _text = Node.string(editor.children[editor.selection.focus.path[0]])
  const _offset = parseInt(flattenOffset(editor, editor.selection.focus), 10)

  // check if previous character is a white space, if so, remove whitespace and recalculate text and offset
  const _prevWhiteSpace = _text.charAt(_offset - 1) === '\u2060'
  if (_prevWhiteSpace) {
    Transforms.delete(editor, {
      distance: 1,
      unit: 'character',
      reverse: true,
    })
    return true
  }
  return false
}

const ContentEditable = ({
  onDocumentChange,
  focusIndex,
  autofocus,
  readonly,
  onNavigateUpFromTop,
  editorRef,
}) => {
  const editorContext = useEditorContext()
  const navigationContext = useNavigationContext()

  const setSource = useSourceContext(c => c && c.setSource)

  const removePageFromSourceCacheHeader = useSourceContext(
    c => c && c.removePageFromCacheHeader
  )

  const removePageFromTopicCacheHeader = useTopicContext(
    c => c && c.removePageFromCacheHeader
  )

  const hasPendingPatches = usePageContext(c => c && c.hasPendingPatches)

  const topicContext = useTopicContext()
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
  } = editorContext

  const editor = useMemo(() => withReact(createEditor()), [])
  const valueRef = useRef(null)
  const selectionRef = useRef(null)

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

  // if focus index is provides, move caret
  useEffect(
    () => {
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
    },
    [focusIndex]
  )

  // if new atomic block has been added, save atomic
  useEffect(
    () => {
      if (
        state.newEntities.length &&
        setSource &&
        topicContext &&
        !hasPendingPatches
      ) {
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
    [state.newEntities.length, hasPendingPatches]
  )

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

  useEffect(
    () => {
      if (onDocumentChange) {
        onDocumentChange(editor)
      }
    },
    [editor.operations, editor.children]
  )

  return useMemo(
    () => {
      const onChange = value => {
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

        if (editor.operations.length) {
          setSelection(selection)
        }
      }

      const onKeyDown = event => {
        // if a character has been entered, check if white space exists (firefox fix), if it has, remove character
        if (
          String.fromCharCode(event.keyCode).match(/(\w|\s)/g) ||
          event.key === 'Backspace'
        ) {
          firefoxWhitespaceFix(editor)
        }
        // never allow inline atomics to be entered manually
        if (
          (isPrintable(event) || event.key === 'Backspace') &&
          SlateEditor.marks(editor).inlineTopic
        ) {
          let _currentLeaf = Node.leaf(editor, editor.selection.focus.path)
          const _anchor = editor.selection.anchor
          const _isAnchorAtStartOfLeaf =
            _anchor.offset === 0 && _anchor.path[1] !== 0
          const _isAnchorAtEndOfLeaf =
            _currentLeaf.text.length === _anchor.offset
          if (_isAnchorAtStartOfLeaf) {
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
          if (_currentLeaf.inlineTopic) {
            if (
              !(
                event.key !== 'Backspace' &&
                (_isAnchorAtStartOfLeaf || _isAnchorAtEndOfLeaf)
              )
            ) {
              // if not backspace event and caret was at the start or end of leaf, remove mark and allow character to pass through
              event.preventDefault()
              return
            }
          }
        }

        if (isPrintable(event) && isMarkActive(editor, 'inlineTopic')) {
          toggleMark(editor, 'inlineTopic')
        }

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

        // TODO: inline at start of \n will allow text to be entered with inline markup

        // em dash shortcut
        replaceShortcut(editor, event)

        if (Hotkeys.isTab(event)) {
          event.preventDefault()
          Transforms.insertText(editor, `\t`)
          return
        }

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

        // don't allow a printable key to "overwrite" a selection that spans multiple blocks
        if (
          isPrintable(event) &&
          editor.selection.focus.path[0] !== editor.selection.anchor.path[0]
        ) {
          event.preventDefault()
          return
        }

        // check for inline atomics
        if (event.key === '@' || event.key === '#') {
          // check if its not at the start of a block
          const _offset = parseInt(
            flattenOffset(editor, editor.selection.focus),
            10
          )
          const _atBlockStart = _offset === 0
          if (!_atBlockStart) {
            // make sure this isnt an atomic closure
            const _text = Node.string(
              editor.children[editor.selection.focus.path[0]]
            )
            const _isClosure = _text.charAt(_offset - 1) === '/'
            console.log(_isClosure)
            // toggle the inline atomic block
            if (!isMarkActive(editor, 'inlineAtomicMenu') && !_isClosure) {
              toggleMark(editor, 'inlineAtomicMenu')
            }
          }
        }

        if (event.key === 'Enter') {
          const _focusedBlock = state.blocks[editor.selection.focus.path[0]]

          const _currentLeaf = Node.leaf(editor, editor.selection.focus.path)

          // let suggest menu handle event if caret is inside of a new active inline atomic
          if (_currentLeaf.inlineAtomicMenu) {
            event.preventDefault()
            return
          }

          // if (SlateEditor.marks(editor).inlineTopic) {
          //   console.log('TOGGLING')
          //   toggleMark(editor, 'inlineTopic')
          // }

          if (isAtomic(_focusedBlock)) {
            if (
              ReactEditor.isFocused(editor) &&
              !selectionHasRange(state.selection) &&
              _focusedBlock.__isActive &&
              !isAtomicClosure(_focusedBlock.type)
            ) {
              showAtomicModal({ editorContext, navigationContext, editor })
            }
            // if closure block is highlighted prevent `enter` key
            if (
              _focusedBlock.__isActive &&
              isAtomicClosure(_focusedBlock.type)
            ) {
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
          const _prevIsBreak = _text.charAt(_offset - 1) === `\n`
          const _prevIsDoubleBreak =
            _prevIsBreak &&
            (_offset - 2 <= 0 || _text.charAt(_offset - 2) === `\n`)
          const _nextIsBreak = _text.charAt(_offset) === `\n`
          const _nextIsDoubleBreak =
            _nextIsBreak && _text.charAt(_offset + 1) === `\n`
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
            if (_currentLeaf.inlineTopic) {
              // // edge case where enter is at the end of an inline atomic
              const _textToInsert = _atBlockEnd ? '\n\u2060' : '\n'
              const { text, offsetAfterInsert } = insertTextAtOffset({
                text: _focusedBlock.text,
                offset: _offset,
                textToInsert: { textValue: _textToInsert, ranges: [] },
              })

              const _newBlock = {
                ..._focusedBlock,
                text,
              }
              //  update the selection
              const _sel = cloneDeep(state.selection)
              _sel.anchor.offset = offsetAfterInsert
              _sel.focus.offset = offsetAfterInsert

              setContent({
                selection: _sel,
                operations: [
                  {
                    index: editor.selection.focus.path[0],
                    text: _newBlock.text,
                    withRerender: true,
                  },
                ],
              })
              event.preventDefault()
              return
            }
            // we're not creating a new block, so just insert a carriage return
            event.preventDefault()
            Transforms.insertText(editor, `\n`)
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
            // check to see if block is atomic and was the last block on the page
            if (
              state.blocks.filter(b => b._id === _currentBlock._id).length < 2
            ) {
              // if so, remove page from atomic cache

              ;({
                SOURCE: () => {
                  removePageFromSourceCacheHeader(
                    _currentBlock._id,
                    state.pageHeader._id
                  )
                },
                TOPIC: () => {
                  removePageFromTopicCacheHeader(
                    _currentBlock._id,
                    state.pageHeader._id
                  )
                },
              }[_currentBlock.type]())
            }

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
        }
      }

      if (state.preventDefault) {
        editor.children = valueRef.current
        editor.selection = selectionRef.current
      }

      // store selection because the Transforms below move it around
      let nextSelection = editor.selection

      state.operations.forEach(op => {
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

      const onInlineAtomicClick = inlineData => {
        // pass editorContext
        const inlineAtomicData = {
          refId: inlineData.refId,
          type: inlineData.type,
        }

        const modalData = {
          editorContext,
          editor,
          navigationContext,
          inlineAtomicData,
        }
        showAtomicModal(modalData)
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
        />
      )
    },
    [editor, state]
  )
}

export default ContentEditable
