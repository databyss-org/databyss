import React, { useRef, useEffect, forwardRef } from 'react'
import { Value } from 'slate'
import { Editor, getEventTransfer } from 'slate-react'
import _ from 'lodash'
import ObjectId from 'bson-objectid'
import forkRef from '@databyss-org/ui/lib/forkRef'
import Bugsnag from '@databyss-org/services/lib/bugsnag'
import { useNavigationContext } from '@databyss-org/ui/components/Navigation/NavigationProvider/NavigationProvider'
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
  isInlineSourceSelected,
  NewEditor,
} from './../slateUtils'

import {
  blocksToState,
  getFragFromText,
  isFragmentFullBlock,
  trimFragment,
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
      onSetBlockType,
      deleteBlockByKey,
      deleteBlocksByKeys,
      onPasteAction,
      setBlockRef,
      onNewBlockMenu,
      onEditSource,
      autoFocus,
      onSelectionChange,
      ...others
    },
    ref
  ) => {
    const [editorState, , stateRef] = useEditorContext()

    const [navState] = useNavigationContext()

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

    const handleSelectedBlockChanged = ({
      _nextText,
      _nextEditableState,
      ranges,
    }) => {
      // if not atomic get range and check for location
      if (
        !isAtomicInlineType(
          _nextEditableState.value.document.getNode(activeBlockId).type
        )
      ) {
        const locationLength = ranges.reduce((acc, range) => {
          if (range.marks.findIndex(m => m === 'location') > -1) {
            return range.length + acc
          }
          return acc
        }, 0)

        // if type LOCATION is set check for non LOCATION type
        if (
          _nextEditableState.value.document.getNode(activeBlockId).type ===
            'LOCATION' &&
          locationLength !== _nextText.length
        ) {
          onSetBlockType('ENTRY', activeBlockId, _nextEditableState)
        }
        // if whole entry has a location range set block as LOCATION
        if (
          _nextText.length !== 0 &&
          locationLength === _nextText.length &&
          _nextEditableState.value.document.getNode(activeBlockId).type !==
            'LOCATION'
        ) {
          onSetBlockType('LOCATION', activeBlockId, _nextEditableState)
        }
      }
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
        if (blockChanges) {
          handleSelectedBlockChanged(blockChanges)
        } else if (!value.selection.isBlurred) {
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
    const editSource = (_id, editor) => {
      const _refId = stateRef.current.blocks[_id].refId
      onEditSource(_refId, editor)
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

      if (event.key === 'Backspace' || hotKeys.isCut(event)) {
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
      if (hotKeys.isEsc(event)) {
        onNewBlockMenu(false, editor)
      }

      if (isInlineSourceSelected(editor) && event.key === 'Enter') {
        const _id = editor.value.anchorBlock.key
        editSource(_id, editor)
        return event.preventDefault()
      }

      const { fragment } = editor.value
      // check for selection

      if (hasSelection(editor.value)) {
        if (event.key === 'Backspace' || hotKeys.isCut(event)) {
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
          (event.key === 'Backspace' || hotKeys.isCut(event)) &&
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
          if (
            (event.key === 'Backspace' || hotKeys.isCut(event)) &&
            editor.value.previousBlock.text
          ) {
            if (
              !editor.value.selection.focus.isAtStartOfNode(
                editor.value.anchorBlock
              )
            ) {
              return next()
            }
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

    const onPaste = (event, editor) => {
      // if new block is created in reducer
      // use this _id
      const _beforeBlockId = ObjectId().toHexString()
      const _beforeBlockRef = ObjectId().toHexString()
      const _afterBlockId = ObjectId().toHexString()
      const _afterBlockRef = ObjectId().toHexString()

      if (isAtomicInlineType(editor.value.anchorBlock.type)) {
        return event.preventDefault()
      }
      // TODO: if html convert to ranges

      const { value } = editor
      const _offset = value.selection.anchor.offset
      const transfer = getEventTransfer(event)

      const { fragment, type } = transfer

      let _frag = fragment
      // get anchor block from slate,
      const anchorKey = value.anchorBlock.key

      // if anchor block is not empty and first fragment is atomic
      // prompt a warning that pasting atomic blocks is only

      if (
        type === 'fragment' ||
        isFragmentFullBlock(fragment, value.document)
      ) {
        if (_frag.nodes.size > 1) {
          _frag = trimFragment(_frag)
        }

        // get list of refId and Id of fragment to paste,
        // this list is used to keep slate and state in sync
        let _blockList = blocksToState(_frag.nodes)
        // look up refId's for all sources and replace them in _blockList and _frag

        _blockList.forEach((b, i) => {
          const _block = b[Object.keys(b)[0]]
          if (_block.type === 'SOURCE') {
            // look up source in dictionary

            const _dictSource = stateRef.current.sources[_block.refId]
            // replace in blockList
            _blockList[i] = {
              [_block._id]: {
                ..._block,
                text: _dictSource.textValue,
                ranges: _dictSource.ranges,
              },
            }
            // look up first instance of refID in state
            const _idList = Object.keys(stateRef.current.blocks)
            const _id = _idList.find(id => {
              if (stateRef.current.blocks[id].refId === _block.refId) {
                return true
              }
              return false
            })
            const _node = editor.value.document.getNode(_id).toJSON()
            const _editor = NewEditor()
            _editor.insertFragment(_frag)
            const _nodeList = _editor.value.document.nodes.map(n => n.key)
            _editor.replaceNodeByKey(_nodeList.get(i), _node)
            _frag = _editor.value.document
            // replace in fragment
          }
        })
        _blockList = blocksToState(_frag.nodes)

        const _pasteData = {
          anchorKey,
          blockList: _blockList,
          fragment: _frag,
          offset: _offset,
          beforeBlockId: _beforeBlockId,
          beforeBlockRef: _beforeBlockRef,
          afterBlockId: _afterBlockId,
          afterBlockRef: _afterBlockRef,
        }
        onPasteAction(_pasteData, editor)
        return event.preventDefault()
      }

      // if plaintext or html is pasted
      const _textData = getFragFromText(transfer.text)
      const _blockList = _textData._blockList
      _frag = _textData._frag
      const _pasteData = {
        anchorKey,
        blockList: _blockList,
        fragment: _frag,
        offset: _offset,
        beforeBlockId: _beforeBlockId,
        beforeBlockRef: _beforeBlockRef,
        afterBlockId: _afterBlockId,
        afterBlockRef: _afterBlockRef,
      }
      onPasteAction(_pasteData, editor)
      return event.preventDefault()
    }

    const onSelect = (event, editor, next) => {
      let _needsUpdate = false
      // if item has selection
      if (!editor.value.selection.isCollapsed) {
        const _frag = editor.value.fragment
        const _selection = editor.value.selection
        const _anchor = _selection.isForward
          ? editor.value.selection.anchor
          : editor.value.selection.focus
        const _focus = _selection.isForward
          ? editor.value.selection.focus
          : editor.value.selection.anchor
        /* 
          if fragment is one block long check to see if full block is selected 
        */

        if (
          _frag.nodes.size === 1 &&
          isAtomicInlineType(_frag.nodes.get(0).type)
        ) {
          const _isAtStart = _anchor.isAtStartOfNode(editor.value.anchorBlock)
          if (!_isAtStart) {
            _needsUpdate = true
            if (_selection.isForward) {
              editor.moveAnchorToStartOfNode(editor.value.anchorBlock)
            } else {
              editor.moveFocusToStartOfNode(editor.value.anchorBlock)
            }
          }

          const _isAtEnd = _focus.isAtEndOfNode(editor.value.anchorBlock)

          if (!_isAtEnd) {
            _needsUpdate = true
            if (_selection.isForward) {
              editor.moveFocusToEndOfNode(editor.value.anchorBlock)
            } else {
              editor.moveAnchorToEndOfNode(editor.value.anchorBlock)
            }
          }
        } else {
          // check first and last node for atomic type
          // check if anchor or focus are at end or start of node
          // if not move focus or anchor to end or start of node
          const _firstFrag = editor.value.document.getNode([
            _anchor.path.get(0),
          ])
          const _lastFrag = editor.value.document.getNode([_focus.path.get(0)])

          if (isAtomicInlineType(_firstFrag.type)) {
            const _isAtStart = _anchor.isAtStartOfNode(_firstFrag)

            if (!_isAtStart) {
              _needsUpdate = true
              if (_selection.isForward) {
                editor.moveAnchorToStartOfNode(_firstFrag)
              } else {
                editor.moveFocusToStartOfNode(_firstFrag)
              }
            }
          }
          if (isAtomicInlineType(_lastFrag.type)) {
            const _isAtEnd = _focus.isAtEndOfNode(_lastFrag)
            if (!_isAtEnd) {
              _needsUpdate = true
              if (_selection.isForward) {
                editor.moveFocusToEndOfNode(_lastFrag)
              } else {
                editor.moveAnchorToEndOfNode(_lastFrag)
              }
            }
          }
        }
      }
      if (_needsUpdate) {
        onSelectionChange(editor)
      } else {
        next()
      }
    }

    return (
      <Editor
        value={_editableState.value}
        onPaste={onPaste}
        onSelect={onSelect}
        readOnly={navState.modals.length > 0}
        ref={forkRef(ref, editableRef)}
        autoFocus={autoFocus}
        onChange={onChange}
        renderBlock={renderBlock}
        renderInline={renderInline(onEditSource)}
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
