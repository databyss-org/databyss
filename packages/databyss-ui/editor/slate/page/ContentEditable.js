import React, { useRef, useEffect, forwardRef } from 'react'
import { Value } from 'slate'
import { Editor, cloneFragment } from 'slate-react'
import _ from 'lodash'
import ObjectId from 'bson-objectid'
import forkRef from '@databyss-org/ui/lib/forkRef'
import Bugsnag from '@databyss-org/services/lib/bugsnag'

import { useNavigationContext } from '@databyss-org/ui/components/Navigation/NavigationProvider/NavigationProvider'
import { useSourceContext } from '@databyss-org/services/sources/SourceProvider'
import { useTopicContext } from '@databyss-org/services/topics/TopicProvider'
import {
  getRawHtmlForBlock,
  getRangesForBlock,
} from './../../state/page/reducer'
import { findActiveBlock, isAtomicInlineType } from './reducer'
import { useEditorContext } from '../../EditorProvider'
import FormatMenu from '../../Menu/FormatMenu'
import hotKeys, { formatHotKeys, navHotKeys } from './../hotKeys'
import { renderBlock } from './../../EditorBlock'

import {
  toSlateJson,
  renderInline,
  renderMark,
  getBlockRanges,
  singleBlockBackspaceCheck,
  hasSelection,
  noAtomicInSelection,
  getSelectedBlocks,
  isInlineAtomicSelected,
} from './../slateUtils'

import {
  isFragmentFullBlock,
  getPasteData,
  extendSelectionForClipboard,
} from './../clipboard'

const schema = {
  inlines: {
    SOURCE: {
      isVoid: true,
    },
    TOPIC: {
      isVoid: true,
    },
  },
}

const SlateContentEditable = forwardRef(
  (
    {
      onActiveBlockIdChange,
      onActiveBlockContentChange,
      onEditableStateChange,
      onNewActiveBlock,
      onBackspace,
      onBlockBlur,
      onDocumentChange,
      OnToggleMark,
      onHotKey,
      deleteBlockByKey,
      deleteBlocksByKeys,
      onPasteAction,
      setBlockRef,
      onNewBlockMenu,
      autoFocus,
      onCutBlocks,
      onDirtyAtomic,
      onEditAtomic,
      readOnly,
      ...others
    },
    ref
  ) => {
    const [editorState, , stateRef] = useEditorContext()

    const { modals } = useNavigationContext()
    const { getSource } = useSourceContext()
    const { getTopic } = useTopicContext()

    const { activeBlockId, editableState, blocks, page } = editorState

    const editableRef = useRef(null)

    const checkSelectedBlockChanged = _nextEditableState => {
      const _nextActiveBlock = findActiveBlock(_nextEditableState.value)
      if (!_nextActiveBlock) {
        return false
      }
      // checks for active block ID change
      if (_nextActiveBlock.key !== activeBlockId) {
        let text = ''
        if (_nextEditableState.value.document.getNode(activeBlockId)) {
          text = _nextEditableState.value.document.getNode(activeBlockId).text
        }
        onBlockBlur(activeBlockId, text, _nextEditableState)
        onActiveBlockIdChange(_nextActiveBlock.key, _nextEditableState)

        return true
      }
      /*
      this section ensures a sync is maintained between the slate and our internal state, if any refIds fall out of sync, the state refID is applied to slate
      */

      // check if current blockId matches refId in data parameter
      const _nextRefId = _nextActiveBlock.data.get('refId')

      // if state has refID for current block
      // set slate refId of block
      if (blocks[_nextActiveBlock.key]) {
        if (!_nextRefId) {
          // TODO REPLACE THIS
          setBlockRef(
            _nextActiveBlock.key,
            blocks[_nextActiveBlock.key].refId,
            _nextEditableState
          )
          return false
        }

        // if refId's dont match, use state value to set slate value
        if (_nextRefId !== blocks[_nextActiveBlock.key].refId) {
          setBlockRef(
            _nextActiveBlock.key,
            blocks[_nextActiveBlock.key].refId,
            _nextEditableState
          )
          return false
        }

        // check previous blocks refIds to ensure proper sync
        // when enter is placed at the beginning of atomic block
        // previous refId's sync is lost
        if (_nextEditableState.value.previousBlock) {
          const _prevKey = _nextEditableState.value.previousBlock.key
          const _previousRef = _nextEditableState.value.previousBlock.data.get(
            'refId'
          )
          if (blocks[_prevKey]) {
            const _previousStateRef = blocks[_prevKey].refId
            if (_previousStateRef !== _previousRef) {
              setBlockRef(_prevKey, _previousStateRef, _nextEditableState)
            }
          }
        }

        //  return false
      }
      return false
    }

    // checks editor state for active block content changed
    const checkActiveBlockContentChanged = _nextEditableState => {
      // on first click on change returns null values for anchor block
      if (!_nextEditableState.value.anchorBlock) {
        return false
      }
      if (
        !editorState.activeBlockId ||
        !activeBlockId ||
        !blocks[activeBlockId]
      ) {
        return false
      }

      const _prevText = getRawHtmlForBlock(editorState, blocks[activeBlockId])
      const _nextText = _nextEditableState.value.document.getNode(activeBlockId)
        .text
      if (isAtomicInlineType(_nextEditableState.value.anchorBlock.type)) {
        return false
      }

      // gets ranges and compares them to current ranges
      const block = _nextEditableState.value.anchorBlock
      const ranges = getBlockRanges(block)
      const _ranges = getRangesForBlock(editorState, blocks[activeBlockId])

      if (_nextText !== _prevText || !_.isEqual(_ranges, ranges)) {
        onActiveBlockContentChange(_nextText, _nextEditableState, ranges)
        return { _nextText, _nextEditableState, ranges }
      }
      return false
    }

    const onChange = change => {
      const { value } = change

      Bugsnag.client.leaveBreadcrumb('page/ContentEditable/onChange', {
        state: JSON.stringify(editorState, null, 2),
      })
      if (onDocumentChange) {
        onDocumentChange(value.document.toJSON())
      }
      if (!checkSelectedBlockChanged({ value })) {
        const blockChanges = checkActiveBlockContentChanged({ value })
        if (!blockChanges && !value.selection.isBlurred) {
          // issue https://github.com/ianstormtaylor/slate/issues/2432
          onEditableStateChange({ value })
        }
      }
    }

    const _editableState = editableState || {
      value: Value.fromJSON(
        toSlateJson(editorState, page.blocks.map(item => blocks[item._id]))
      ),
    }

    useEffect(
      () =>
        _editableState.editorCommands &&
        _editableState.editorCommands(
          editableRef.current,
          _editableState.value,
          () => editableRef.current.controller.flush()
        )
    )

    const deleteBlocksFromSelection = editor => {
      const _nodeList = getSelectedBlocks(editor.value)
      const _nodesToDelete = _nodeList.map(n => n.key)
      deleteBlocksByKeys(_nodesToDelete, editor)
    }

    const cutBlocksFromSelection = editor => {
      const _newBlockRef = ObjectId().toHexString()
      const _newBlockId = ObjectId().toHexString()

      const _nodeList = getSelectedBlocks(editor.value)
      const _nodesToDelete = _nodeList.map(n => n.key)
      onCutBlocks(_nodesToDelete, _newBlockRef, _newBlockId, editor)
    }

    const renderEditor = (_, editor, next) => {
      const children = next()

      return (
        <React.Fragment>
          {children}
          <FormatMenu editor={editor} />
        </React.Fragment>
      )
    }

    // this will get removed when paths are implemented
    const editAtomic = editor => {
      const { key, type } = editor.value.anchorBlock
      const _refId = stateRef.current.blocks[key].refId
      //  onEditSource(_refId, editor)
      onEditAtomic(_refId, type, editor)
    }

    const onCopy = (event, editor) => {
      cloneFragment(event, editor)
      return true
    }

    const onKeyUp = (event, editor, next) => {
      if (event.key === 'Enter') {
        // IF WE HAVE ATOMIC BLOCK HIGHLIGHTED
        // PREVENT NEW BLOCK
        if (
          isAtomicInlineType(editor.value.anchorBlock.type) &&
          !editor.value.selection.focus.isAtStartOfNode(
            editor.value.anchorBlock
          ) &&
          !editor.value.selection.focus.isAtEndOfNode(editor.value.anchorBlock)
        ) {
          return event.preventDefault()
        }
        // if its atomic get text value from state
        const blockProperties = {
          insertedBlockId: editor.value.anchorBlock.key,
          insertedBlockText: editor.value.anchorBlock.text,
          previousBlockId: editor.value.previousBlock
            ? editor.value.previousBlock.key
            : null,
          previousBlockText: editor.value.previousBlock
            ? editor.value.previousBlock.text
            : null,
        }
        const _editorState = { value: editor.value }
        onNewActiveBlock(blockProperties, _editorState)
      }

      if (event.key === 'Backspace') {
        const blockProperties = {
          activeBlockId: editor.value.anchorBlock.key,
          nextBlockId: editor.value.nextBlock
            ? editor.value.nextBlock.key
            : null,
        }

        // https://www.notion.so/databyss/Delete-doesn-t-always-work-when-text-is-selected-932220d69dc84bbbb133265d8575a123
        // case 2
        // event is handled onKeyDown
        if (!noAtomicInSelection(editor.value)) {
          // if atomic block is highlighted
          if (editor.value.fragment.nodes.size > 1) {
            return event.preventDefault()
          }
        }

        // https://www.notion.so/databyss/Editor-crashes-on-backspace-edge-case-f3fd18b2ba6e4df190703a94815542ed
        if (singleBlockBackspaceCheck(editor.value)) {
          // check selection
          if (editor.value.previousBlock && hasSelection(editor.value)) {
            deleteBlockByKey(getSelectedBlocks(editor.value).get(0).key, editor)
            return event.preventDefault()
          }
        }

        const _editorState = { value: editor.value }

        onBackspace(blockProperties, _editorState)
      }
      // special case:
      // if cursor is immediately before or after the atomic source in a
      // SOURCE block, prevent all
      return next()
    }

    const onKeyDown = (event, editor, next) => {
      if (hotKeys.isCopy(event)) {
        return onCopy(event, editor, next)
      }
      if (hotKeys.isCut(event)) {
        return next()
      }
      if (hotKeys.isEsc(event)) {
        onNewBlockMenu(false, editor)
      }

      if (isInlineAtomicSelected(editor) && event.key === 'Enter') {
        editAtomic(editor)
        return event.preventDefault()
      }

      const { fragment } = editor.value
      // check for selection

      if (hasSelection(editor.value)) {
        if (event.key === 'Backspace') {
          if (!noAtomicInSelection(editor.value)) {
            // EDGE CASE: prevent block from being deleted when empty block highlighted
            if (fragment.text === '') {
              deleteBlocksFromSelection(editor)
              return event.preventDefault()
            }
            // https://www.notion.so/databyss/Delete-doesn-t-always-work-when-text-is-selected-932220d69dc84bbbb133265d8575a123
            // case 1
            // if atomic block is highlighted
            if (fragment.nodes.size === 1) {
              deleteBlockByKey(editor.value.anchorBlock.key, editor)
              return event.preventDefault()
            }
            // case 2

            deleteBlocksFromSelection(editor)
            return event.preventDefault()
          }
          // delete multiple text blocks
          const _selectedBlocks = getSelectedBlocks(editor.value)
          if (_selectedBlocks.size > 1) {
            // TODO: check for fragments of blocks
            // this deletes whole block
            deleteBlocksFromSelection(editor)
            return event.preventDefault()
          }
          if (singleBlockBackspaceCheck(editor.value)) {
            deleteBlockByKey(getSelectedBlocks(editor.value).get(0).key, editor)
            return event.preventDefault()
          }
        }
      }

      navHotKeys(event, editor, onHotKey, OnToggleMark)

      // if previous block is atomic delete previous block
      if (editor.value.previousBlock) {
        if (
          isAtomicInlineType(editor.value.previousBlock.type) &&
          event.key === 'Backspace' &&
          editor.value.selection.focus.isAtStartOfNode(
            editor.value.anchorBlock
          ) &&
          !hasSelection(editor.value) &&
          editor.value.anchorBlock.text.length !== 0
        ) {
          deleteBlockByKey(editor.value.previousBlock.key, editor)
          return event.preventDefault()
        }
      }

      if (isAtomicInlineType(editor.value.anchorBlock.type)) {
        // does not allow paste on atomic blocks
        if (hotKeys.isPaste(event)) {
          return event.preventDefault()
        }
        if (
          event.key === 'Backspace' ||
          event.key === 'Enter' ||
          event.key === 'ArrowLeft' ||
          event.key === 'ArrowRight' ||
          event.key === 'ArrowUp' ||
          event.key === 'ArrowDown' ||
          (event.metaKey &&
            !(
              hotKeys.isBold(event) ||
              hotKeys.isItalic(event) ||
              hotKeys.isLocation(event)
            ))
        ) {
          // if previous block doesnt exist
          if (!editor.value.previousBlock) {
            return next()
          }

          // allow backspace
          if (event.key === 'Backspace' && editor.value.previousBlock.text) {
            if (
              !editor.value.selection.focus.isAtStartOfNode(
                editor.value.anchorBlock
              )
            ) {
              return next()
            }
            return event.preventDefault()
          }

          if (event.key === 'Backspace' && !editor.value.previousBlock.text) {
            const _prevKey = editor.value.previousBlock.key

            deleteBlockByKey(_prevKey, editor)
            return event.preventDefault()
          }

          // IF WE HAVE ATOMIC BLOCK HIGHLIGHTED
          // PREVENT ENTER KEY
          if (
            event.key === 'Enter' &&
            !editor.value.selection.focus.isAtStartOfNode(
              editor.value.anchorBlock
            ) &&
            !editor.value.selection.focus.isAtEndOfNode(
              editor.value.anchorBlock
            )
          ) {
            return event.preventDefault()
          }
          return next()
        }
        // for windows machines
        if (hotKeys.isCopy(event) || hotKeys.isCut(event)) {
          return next()
        }
        return event.preventDefault()
      }

      formatHotKeys(event, editor, onHotKey, OnToggleMark)

      if (hotKeys.isTab(event)) {
        event.preventDefault()
        onHotKey('TAB', editor)
      }
      if (hotKeys.isLocation(event)) {
        event.preventDefault()
        OnToggleMark('location', editor)
      }

      return next()
    }

    const onCut = (event, editor) => {
      cloneFragment(event, editor)
      window.requestAnimationFrame(() => {
        if (isFragmentFullBlock(editor.value.fragment, editor.value.document)) {
          cutBlocksFromSelection(editor)
        } else {
          editor.delete()
        }
      })

      return true
    }

    const onPaste = (event, editor) => {
      // derefrence here
      const _pasteData = getPasteData({
        event,
        editor,
        getSource,
        getTopic,
        onDirtyAtomic,
      })
      if (!_pasteData) {
        return event.preventDefault()
      }
      onPasteAction(_pasteData, editor)
      return event.preventDefault()
    }

    const onSelect = (event, editor, next) => {
      /*
      extends selections to include full atomic block
      */
      const _response = extendSelectionForClipboard(editor)
      if (!_response.update) {
        next()
      }
    }

    return (
      <Editor
        value={_editableState.value}
        onPaste={onPaste}
        onCut={onCut}
        onDrop={e => e.preventDefault()}
        onSelect={onSelect}
        readOnly={modals.length > 0 || readOnly}
        ref={forkRef(ref, editableRef)}
        autoFocus={autoFocus}
        onChange={onChange}
        renderBlock={renderBlock}
        renderInline={renderInline(onEditAtomic)}
        renderEditor={renderEditor}
        schema={schema}
        onKeyUp={onKeyUp}
        onKeyDown={onKeyDown}
        renderMark={renderMark}
        style={{ flex: 1 }}
        {...others}
      />
    )
  }
)

export default SlateContentEditable
