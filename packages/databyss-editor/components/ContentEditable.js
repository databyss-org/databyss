import React, { useMemo, useRef, useEffect, useImperativeHandle } from 'react'
import {
  createEditor,
  Node,
  Transforms,
  Point,
  Range,
} from '@databyss-org/slate'
import { EM, updateAccessedAt } from '@databyss-org/data/pouchdb/utils'
import { ReactEditor, withReact } from '@databyss-org/slate-react'
import { setSource } from '@databyss-org/services/sources'
import { setEmbed } from '@databyss-org/services/embeds'
import { setTopic } from '@databyss-org/data/pouchdb/topics'
import { useNavigationContext } from '@databyss-org/ui/components/Navigation/NavigationProvider'
import { copyToClipboard } from '@databyss-org/ui/components/PageContent/PageMenu'
import { useQueryClient } from '@tanstack/react-query'
import {
  blockTypeToSelector,
  selectors,
} from '@databyss-org/data/pouchdb/selectors'
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
  getInlineAtomicHref,
} from '../lib/util'
import Hotkeys, { isPrintable } from './../lib/hotKeys'
import { symbolToAtomicType, selectionHasRange } from '../state/util'
import { isAtomicClosure } from './AtomicHeader'
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
  onLinkBackspace,
} from '../lib/inlineUtils'
import { loadPage } from '../../databyss-services/editorPage'
import { setBlockRelations } from '@databyss-org/data/pouchdb/entries'
import { BlockType } from '../interfaces'

const ContentEditable = ({
  onDocumentChange,
  focusIndex,
  autofocus,
  readonly,
  onNavigateUpFromTop,
  sharedWithGroups,
  firstBlockIsTitle,
  editableRef,
}) => {
  const editorContext = useEditorContext()
  const editorRef = useRef(null)
  const { navigate } = useNavigationContext()
  const queryClient = useQueryClient()
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

  const safelyResetSelection = () => {
    const _selection = {
      anchor: { index: 0, offset: 0 },
      focus: { index: 0, offset: 0 },
    }
    const _slateSelection = stateSelectionToSlateSelection(
      editor.children,
      _selection
    )
    Transforms.select(editor, _slateSelection)
  }

  try {
    if (!valueRef.current || state.operations.reloadAll) {
      let _scroll = null
      if (state.operations.reloadAll) {
        _scroll = editorRef.current?.scrollTop
      }
      editor.children = stateToSlate(state)
      // load selection from DB
      if (state.selection) {
        const selection = stateSelectionToSlateSelection(
          editor.children,
          state.selection
        )
        if (!state.operations.reloadAll) {
          Transforms.select(editor, selection)
          setSelection(state.selection)
        } else if (!Range.isCollapsed(selection)) {
          Transforms.move(editor, { distance: 1 })
          Transforms.move(editor, { distance: 0 })
          requestAnimationFrame(() => {
            Transforms.select(editor, selection)
          })
        } else {
          Transforms.select(editor, selection)
        }
      }
      if (_scroll) {
        requestAnimationFrame(() => {
          editorRef.current.scrollTop = _scroll
        })
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
      setBlockRelations(_payload, queryClient)
    })
  }, [state.removedEntities])

  // if focus index is provides, move caret
  useEffect(() => {
    // console.log('[ContentEditable] focusIndex', focusIndex)
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

        if (_data) {
          const _types = {
            SOURCE: () => {
              window.requestAnimationFrame(() => setSource(_data))
            },
            TOPIC: () => {
              window.requestAnimationFrame(() => setTopic(_data))
            },
            EMBED: () => {
              window.requestAnimationFrame(() => setEmbed(_data))
            },
            LINK: () => null,
          }
          _types[entity.type.toUpperCase()]()
        }

        // set BlockRelation property
        const _payload = {
          operationType: 'ADD',
          type: entity.type,
          _id: entity._id,
          page: state.pageHeader?._id,
        }

        updateAccessedAt(
          entity._id,
          queryClient,
          blockTypeToSelector(entity.type)
        )

        setBlockRelations(_payload, queryClient)
        removeEntityFromQueue(entity._id)
      })
    }
    if (state.newEntities.length) {
      _process()
    }
  }, [state.newEntities.length])

  useImperativeHandle(editableRef, () => ({
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

  let currentLeaf = null
  if (editor.selection) {
    currentLeaf = Node.leaf(editor, editor.selection.focus.path)
  }

  useEffect(() => {
    if (
      currentLeaf &&
      currentLeaf.embed &&
      editor.selection.focus.offset < currentLeaf.text.length &&
      Range.isCollapsed(editor.selection)
    ) {
      Transforms.select(editor, {
        path: editor.selection.focus.path,
        offset: currentLeaf.text.length,
      })
    }
  }, [currentLeaf, editor.selection?.focus.offset])

  const onInlineAtomicClick = (inlineData) => {
    navigate(getInlineAtomicHref(inlineData))
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
        inlineAtomicBlockCorrector({ event, editor, state })
      }

      // HACK: because we make embeds display as 'inline-block', slate or contenteditable sees
      // the block as one continous line (ignores line breaks) when using up/down arrows. We
      // restore expected up/down arrow behavior by manipulating the selection
      if (currentLeaf.embed) {
        if (
          event.key === 'ArrowDown' &&
          editor.children[editor.selection.focus.path[0]].children.length >
            editor.selection.focus.path[1] + 1
        ) {
          event.preventDefault()
          const _fpoint = {
            path: [
              editor.selection.focus.path[0],
              editor.selection.focus.path[1] + 1,
            ],
            offset: 1,
          }
          Transforms.select(
            editor,
            Range.isCollapsed(editor.selection)
              ? _fpoint
              : {
                  focus: _fpoint,
                  anchor: editor.selection.anchor,
                }
          )
        }
        if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
          let _fpoint = null
          if (editor.selection.focus.path[1] > 0) {
            _fpoint = {
              path: [
                editor.selection.focus.path[0],
                editor.selection.focus.path[1] - 1,
              ],
              offset:
                editor.children[editor.selection.focus.path[0]].children[
                  editor.selection.focus.path[1] - 1
                ].text.length,
            }
          } else if (editor.selection.focus.path[0] > 0) {
            const _prevIndexNode =
              editor.children[editor.selection.focus.path[0] - 1]
            _fpoint = {
              path: [
                editor.selection.focus.path[0] - 1,
                _prevIndexNode.children.length - 1,
              ],
              offset:
                _prevIndexNode.children[_prevIndexNode.children.length - 1].text
                  .length,
            }
          } else {
            _fpoint = {
              path: editor.selection.focus.path,
              offset: 0,
            }
          }
          event.preventDefault()
          Transforms.select(
            editor,
            Range.isCollapsed(editor.selection)
              ? _fpoint
              : {
                  focus: _fpoint,
                  anchor: editor.selection.anchor,
                }
          )
        }
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

      if (Range.isCollapsed(editor.selection)) {
        preventInlineAtomicCharacters(editor, event)
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

      if (Hotkeys.isSelectAll(event)) {
        event.preventDefault()
        const _sel = {
          anchor: { offset: 0, index: 1 },
          focus: {
            index: editor.children.length - 1,
            offset: state.blocks[state.blocks.length - 1].text.textValue.length,
          },
        }
        const _ssel = stateSelectionToSlateSelection(editor.children, _sel)

        window.requestAnimationFrame(() => {
          Transforms.select(editor, _ssel)
        })
        return
      }

      if (Hotkeys.isCopyPageState(event)) {
        event.preventDefault()
        loadPage(state.pageHeader._id).then((page) => {
          copyToClipboard(JSON.stringify(page, null, 2))
          console.log('[ContentEditable] state copied to clipboard')
        })
        return
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
        const _focusedBlock = state.blocks[editor.selection.focus.path[0]]

        const isCurrentlyInInlineAtomicField = onEnterInlineField({
          event,
          currentLeaf,
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
            onInlineAtomicClick({
              atomicType: _focusedBlock.type,
              id: _focusedBlock._id,
            })
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
          (firstBlockIsTitle && editor.selection.focus.path[0] === 0) ||
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
            currentLeaf,
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

        // handle backspace on empty line after title
        if (
          editor.selection.focus.path[0] === 1 &&
          state.blocks.length > 2 &&
          isEmpty(state.blocks[editor.selection.focus.path[0]])
        ) {
          event.preventDefault()
          Transforms.delete(editor, {
            distance: 1,
            unit: 'character',
          })
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

        const _inlineLinkRemoved = onLinkBackspace({
          state,
          editor,
          event,
          setContent,
        })
        if (_inlineLinkRemoved) {
          return
        }

        const currentBlock = state.blocks[_currentIndex]
        onInlineFieldBackspace({
          editor,
          event,
          currentBlock,
        })
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
          {
            type: _block.type,
            isTitle: op.index === 0,
          },
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
          // window.requestAnimationFrame(() => {
          //   Transforms.insertNodes(editor, {
          //     text: '\n',
          //   })
          // })
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
          safelyResetSelection()
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
        editorRef={editorRef}
      />
    )
  }, [editor, state, readonly])
}

export default ContentEditable
