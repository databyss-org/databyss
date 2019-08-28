import React, { useRef } from 'react'
import { Editor } from 'slate-react'
import { Value } from 'slate'
import EditorBlock from './EditorBlock'
import { getRawHtmlForBlock } from './state/reducer'
import { findActiveBlock } from './state/slateReducer'
import { useEditorContext } from './EditorProvider'

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

const SlateContentEditable = ({
  onActiveBlockIdChange,
  onActiveBlockContentChange,
  onEditableStateChange,
}) => {
  const [editorState] = useEditorContext()
  const { activeBlockId, editableState, blocks, page } = editorState
  const editableRef = useRef(null)

  // checks editor state for active block changed
  const checkSelectedBlockChanged = _nextEditableState => {
    const _nextActiveBlock = findActiveBlock(_nextEditableState)
    if (!_nextActiveBlock) {
      return false
    }

    if (_nextActiveBlock.key !== activeBlockId) {
      onActiveBlockIdChange(_nextActiveBlock.key, _nextEditableState)
      return true
    }
    return false
  }

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
    const editor = editableRef.current
    if (
      !checkSelectedBlockChanged({ value, editor }) &&
      !checkActiveBlockContentChanged({ value, editor })
    ) {
      onEditableStateChange({ value, editor })
    }
  }

  const renderBlock = ({ node, children }) => (
    <EditorBlock type={node.type}>{children}</EditorBlock>
  )

  const _editableState = editableState || {
    value: Value.fromJSON(
      toSlateJson(editorState, page.blocks.map(item => blocks[item._id]))
    ),
    editor: editableRef.current,
  }

  return (
    <Editor
      value={_editableState.value}
      ref={editableRef}
      onChange={onChange}
      renderBlock={renderBlock}
    />
  )
}

export default SlateContentEditable
