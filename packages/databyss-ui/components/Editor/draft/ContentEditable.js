import React from 'react'
import {
  Editor,
  EditorBlock as DraftBlock,
  EditorState,
  ContentState,
  ContentBlock,
} from 'draft-js'
import EditorBlock from '../EditorBlock'
import { getRawHtmlForBlock } from '../state/reducer'
import { useEditorContext } from '../EditorProvider'

const setDraftStateBlocks = (state, editableState, pageBlocks) => {
  const _blockArray = pageBlocks.map(
    block =>
      new ContentBlock({
        key: block._id,
        text: getRawHtmlForBlock(state, block),
        type: block.type,
      })
  )
  const contentState = ContentState.createFromBlockArray(_blockArray)
  return EditorState.push(editableState, contentState, 'insert-characters')
}

const DraftContentEditable = ({
  onActiveBlockIdChange,
  onActiveBlockContentChange,
  onEditableStateChange,
}) => {
  const [editorState] = useEditorContext()
  const { activeBlockId, editableState, blocks, page } = editorState

  // checks editor state for active block changed
  const checkSelectedBlockChanged = _nextEditableState => {
    const _nextActiveBlockId = _nextEditableState.getSelection().getFocusKey()
    if (_nextActiveBlockId !== activeBlockId) {
      onActiveBlockIdChange(_nextActiveBlockId, _nextEditableState)
      return true
    }
    return false
  }

  const checkActiveBlockContentChanged = _nextEditableState => {
    const _nextText = _nextEditableState
      .getCurrentContent()
      .getBlockForKey(activeBlockId)
      .getText()
    const _prevText = getRawHtmlForBlock(
      editorState,
      blocks[editorState.activeBlockId]
    )
    if (_nextText !== _prevText) {
      onActiveBlockContentChange(_nextText, _nextEditableState)
      return true
    }
    return false
  }

  const onChange = _editableState => {
    if (
      !checkSelectedBlockChanged(_editableState) &&
      !checkActiveBlockContentChanged(_editableState)
    ) {
      onEditableStateChange(_editableState)
    }
  }

  const blockRendererFn = () => ({
    component: ({ block, ...others }) => (
      <EditorBlock type={block.getType()}>
        <DraftBlock block={block} {...others}>
          {block.getText()}
        </DraftBlock>
      </EditorBlock>
    ),
    editable: true,
  })

  const _editableState =
    editableState ||
    setDraftStateBlocks(
      editorState,
      EditorState.createEmpty(),
      page.blocks.map(item => blocks[item._id])
    )

  return (
    <Editor
      editorState={_editableState}
      onChange={onChange}
      blockRendererFn={blockRendererFn}
    />
  )
}

export default DraftContentEditable
