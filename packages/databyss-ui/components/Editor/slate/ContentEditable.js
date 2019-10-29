import React, { useRef, useEffect } from 'react'
import { KeyUtils, Value, Block } from 'slate'
import ObjectId from 'bson-objectid'
import { Editor } from 'slate-react'
import { RawHtml, View } from '@databyss-org/ui/primitives'
import EditorBlock from '../EditorBlock'
import { getRawHtmlForBlock, entities } from '../state/reducer'
import { findActiveBlock, isAtomicInlineType } from './reducer'
import { useEditorContext } from '../EditorProvider'
import FormatMenu from '../Menu/FormatMenu'
import hotKeys, {
  START_OF_LINE,
  END_OF_LINE,
  START_OF_DOCUMENT,
  END_OF_DOCUMENT,
  NEXT_BLOCK,
  PREVIOUS_BLOCK,
  TAB,
} from './hotKeys'
import { serializeNodeToHtml, sanitizer } from './inlineSerializer'
import { stateToSlate, getRangesFromBlock } from './markup'
import { noAtomicInSelection, getSelectedBlocks } from './../EditorTooltip'

KeyUtils.setGenerator(() => ObjectId().toHexString())

const toSlateJson = (editorState, pageBlocks) => ({
  document: {
    nodes: pageBlocks.map(block => {
      let nodes = []
      switch (block.type) {
        case 'ENTRY':
          nodes = stateToSlate(
            {
              [block.refId]: editorState.entries[block.refId],
            },
            block._id
          )
          break
        case 'LOCATION':
          nodes = stateToSlate(
            {
              [block.refId]: editorState.locations[block.refId],
            },
            block._id
          )
          nodes.type = 'LOCATION'
          break
        default:
          break
      }

      let textBlock
      if (isAtomicInlineType(block.type)) {
        const nodeWithRanges = stateToSlate({
          [block.refId]: entities(editorState, block.type)[block.refId],
        }).nodes

        const _block = Block.fromJSON({
          object: 'block',
          type: block.type,
          nodes: nodeWithRanges,
        })

        const _innerHtml = serializeNodeToHtml(_block)

        textBlock = isAtomicInlineType(block.type)
          ? {
              object: 'inline',
              nodes: [
                {
                  object: 'text',
                  text: sanitizer(_innerHtml),
                },
              ],
              type: block.type,
            }
          : {
              object: 'text',
              text: getRawHtmlForBlock(editorState, block),
            }
      }

      // this will return generic node
      return !isAtomicInlineType(block.type)
        ? nodes
        : {
            object: 'block',
            key: block._id,
            type: block.type,
            nodes: [textBlock],
          }
    }),
  },
})

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

const renderInline = ({ node, attributes }, editor, next) => {
  const isSelected = editor.value.selection.focus.isInNode(node)
  const backgroundColor = isSelected ? 'background.2' : ''

  if (isAtomicInlineType(node.type)) {
    return (
      <RawHtml
        backgroundColor={backgroundColor}
        _html={{ __html: node.text }}
        {...attributes}
      />
    )
  }

  return next()
}

const renderMark = (props, editor, next) => {
  const { children, mark, attributes } = props
  switch (mark.type) {
    case 'bold':
      return <strong {...attributes}>{children}</strong>
    case 'italic':
      return <i {...attributes}>{children}</i>
    case 'location':
      if (editor.value.anchorBlock.type !== 'LOCATION') {
        return (
          <View
            {...attributes}
            borderBottom="1px dashed"
            borderColor="text.4"
            display="inline"
            borderRadius={0}
          >
            {children}
          </View>
        )
      }
      return next()
    default:
      return next()
  }
}

const SlateContentEditable = ({
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
}) => {
  const [editorState] = useEditorContext()

  const { activeBlockId, editableState, blocks, page } = editorState

  const editableRef = useRef(null)

  //  const menuRef = useRef(null)

  const getBlockRanges = block => {
    const jsonBlockValue = { ...block.toJSON(), key: block.key }
    const ranges = getRangesFromBlock(jsonBlockValue).ranges
    return ranges
  }

  const checkSelectedBlockChanged = _nextEditableState => {
    const _nextActiveBlock = findActiveBlock(_nextEditableState.value)
    if (!_nextActiveBlock) {
      return false
    }

    if (_nextActiveBlock.key !== activeBlockId) {
      let rawHtml = ''
      if (_nextEditableState.value.document.getNode(activeBlockId)) {
        rawHtml = _nextEditableState.value.document.getNode(activeBlockId).text
      }

      onBlockBlur(activeBlockId, rawHtml, _nextEditableState)
      onActiveBlockIdChange(_nextActiveBlock.key, _nextEditableState)
      return true
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

    if (_nextText !== _prevText) {
      const block = _nextEditableState.value.anchorBlock
      const ranges = getBlockRanges(block)

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
    if (onDocumentChange) {
      onDocumentChange(value.document.toJSON())
    }
    if (!checkSelectedBlockChanged({ value })) {
      const blockChanges = checkActiveBlockContentChanged({ value })
      if (blockChanges) {
        handleSelectedBlockChanged(blockChanges)
      } else {
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

  // https://www.notion.so/databyss/Editor-crashes-on-backspace-edge-case-f3fd18b2ba6e4df190703a94815542ed
  const singleBlockBackspaceCheck = value => {
    const _selectedBlocks = getSelectedBlocks(value)
    if (
      _selectedBlocks.size === 1 &&
      !isAtomicInlineType(_selectedBlocks.get(0)) &&
      _selectedBlocks.get(0).text.length === 0
    ) {
      return true
    }
    return false
  }

  const hasSelection = value => {
    const { selection } = value
    if (!(selection.isBlurred || selection.isCollapsed)) {
      return true
    }
    return false
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
        previousBlockId: editor.value.previousBlock.key,
        previousBlockText: editor.value.previousBlock.text,
      }
      const _editorState = { value: editor.value }
      onNewActiveBlock(blockProperties, _editorState)
    }

    if (event.key === 'Backspace') {
      const blockProperties = {
        activeBlockId: editor.value.anchorBlock.key,
        nextBlockId: editor.value.nextBlock ? editor.value.nextBlock.key : null,
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
    const { fragment } = editor.value
    // check for selection
    if (hasSelection(editor.value)) {
      if (event.key === 'Backspace' && !noAtomicInSelection(editor.value)) {
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

      if (singleBlockBackspaceCheck(editor.value)) {
        deleteBlockByKey(getSelectedBlocks(editor.value).get(0).key, editor)
        return event.preventDefault()
      }
    }

    if (hotKeys.isStartOfLine(event)) {
      event.preventDefault()
      onHotKey(START_OF_LINE, editor)
    }

    if (hotKeys.isEndOfLine(event)) {
      event.preventDefault()
      onHotKey(END_OF_LINE, editor)
    }

    if (hotKeys.isStartOfDocument(event)) {
      event.preventDefault()
      onHotKey(START_OF_DOCUMENT, editor)
    }
    if (hotKeys.isEndOfDocument(event)) {
      event.preventDefault()
      onHotKey(END_OF_DOCUMENT, editor)
    }

    if (hotKeys.isNextBlock(event)) {
      event.preventDefault()
      onHotKey(NEXT_BLOCK, editor)
    }

    if (hotKeys.isPreviousBlock(event)) {
      event.preventDefault()
      onHotKey(PREVIOUS_BLOCK, editor)
    }

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

        // IF WE HAVE ATOMIC BLOCK HIGHLIGHTED
        // PREVENT ENTER KEY
        if (
          event.key === 'Enter' &&
          !editor.value.selection.focus.isAtStartOfNode(
            editor.value.anchorBlock
          ) &&
          !editor.value.selection.focus.isAtEndOfNode(editor.value.anchorBlock)
        ) {
          return event.preventDefault()
        }

        return next()
      }
      return event.preventDefault()
    }

    if (hotKeys.isTab(event)) {
      event.preventDefault()
      onHotKey(TAB, editor)
    }

    if (hotKeys.isBold(event)) {
      event.preventDefault()
      OnToggleMark('bold', editor)
    }

    if (hotKeys.isLocation(event)) {
      event.preventDefault()
      OnToggleMark('location', editor)
    }

    if (hotKeys.isItalic(event)) {
      event.preventDefault()
      OnToggleMark('italic', editor)
    }

    return next()
  }

  const renderBlock = ({ node, children }) => (
    <EditorBlock node={node}>{children}</EditorBlock>
  )

  const renderEditor = (_, editor, next) => {
    const children = next()

    return (
      <React.Fragment>
        {children}
        <FormatMenu editor={editor} editorState={editorState} />
      </React.Fragment>
    )
  }

  return (
    <Editor
      value={_editableState.value}
      ref={editableRef}
      onChange={onChange}
      renderBlock={renderBlock}
      renderInline={renderInline}
      renderEditor={renderEditor}
      schema={schema}
      onKeyUp={onKeyUp}
      onKeyDown={onKeyDown}
      renderMark={renderMark}
    />
  )
}

export default SlateContentEditable
