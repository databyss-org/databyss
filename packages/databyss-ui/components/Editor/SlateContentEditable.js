import React, { useRef, useEffect } from 'react'
import { KeyUtils, Value } from 'slate'
import ObjectId from 'bson-objectid'
import { Editor } from 'slate-react'
import AutoReplace from './plugins/autoReplace'
import InsertBlockOnEnter from './plugins/InsertBlockOnEnter'
import EditorBlock from './EditorBlock'
import { getRawHtmlForBlock } from './state/reducer'
import { findActiveBlock } from './state/slateReducer'
import { useEditorContext } from './EditorProvider'

KeyUtils.setGenerator(() => ObjectId().toHexString())

const toSlateJson = (editorState, pageBlocks) => ({
  document: {
    nodes: pageBlocks.map(block => ({
      object: 'block',
      key: block._id,
      type: block.type,
      nodes: [
        {
          object: 'text',
          text: getRawHtmlForBlock(editorState, block),
        },
      ],
    })),
  },
})

const plugins = [
  // AutoReplace({
  //   trigger: 'enter',
  //   before: /^(@)+/,
  //   change: (change, e, matches) => {
  //     return change.setBlocks({ type: 'SOURCE', isVoid: true })
  //   },
  // }),
  InsertBlockOnEnter({
    object: 'block',
    type: 'ENTRY',
    nodes: [
      {
        object: 'text',
        text: '',
      },
    ],
  }),
]

const SlateContentEditable = ({
  onActiveBlockIdChange,
  onActiveBlockContentChange,
  onEditableStateChange,
  onNewBlock,
  onBackspace,
  checkTagOnBlur,
}) => {
  const [editorState] = useEditorContext()

  // const { activeBlockId, editableState, blocks, page } = editorState
  const { activeBlockId, editableState, blocks, page } = editorState
  const editableRef = useRef(null)

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

      checkTagOnBlur(activeBlockId, rawHtml, _nextEditableState)
      onActiveBlockIdChange(_nextActiveBlock.key, _nextEditableState)
      return true
    }
    return false
  }

  // checks editor state for active block content changed
  const checkActiveBlockContentChanged = _nextEditableState => {
    if (!editorState.activeBlockId || !activeBlockId) {
      return false
    }
    const _prevText = getRawHtmlForBlock(
      editorState,
      blocks[editorState.activeBlockId]
    )
    const _nextText = _nextEditableState.value.document.getNode(activeBlockId)
      .text
    if (_nextText !== _prevText) {
      onActiveBlockContentChange(_nextText, _nextEditableState)
      return true
    }
    return false
  }

  const onChange = ({ value }) => {
    if (value.anchorBlock) {
      console.log('current type', value.anchorBlock.type)
      console.log('current key', value.anchorBlock.key)
    }
    if (
      !checkSelectedBlockChanged({ value }) &&
      !checkActiveBlockContentChanged({ value })
    ) {
      onEditableStateChange({ value })
    }
  }

  const renderBlock = ({ node, children }) => (
    <EditorBlock type={node.type}>{children}</EditorBlock>
  )

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
        () => undefined
      )
  )

  const onKeyUp = (event, editor, next) => {
    if (event.key === 'Enter') {
      const blockProperties = {
        activeBlockId: editor.value.anchorBlock.key,
        activeBlockText: editor.value.anchorBlock.text,
        previousBlockId: editor.value.previousBlock.key,
        previousBlockText: editor.value.previousBlock.text,
      }
      const editorState = { value: editor.value }
      onNewBlock(blockProperties, editorState)
    }
    if (event.key === 'Backspace') {
      const blockProperties = {
        activeBlockId: editor.value.anchorBlock.key,
        nextBlockId: editor.value.nextBlock ? editor.value.nextBlock.key : null,
      }
      onBackspace(blockProperties, editor)
    }

    return next()
  }

  return (
    <Editor
      value={_editableState.value}
      ref={editableRef}
      onChange={onChange}
      renderBlock={renderBlock}
      plugins={plugins}
      onKeyUp={onKeyUp}
    />
  )
}

export default SlateContentEditable
