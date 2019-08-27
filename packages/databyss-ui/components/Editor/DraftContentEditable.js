import React from 'react'
import { Editor, EditorState, ContentState, ContentBlock } from 'draft-js'
import DraftBlock from './DraftBlock'
import { getRawHtmlForBlock } from './state/reducer'
import { useEditorContext } from './DraftEditorProvider'

const setDraftStateBlocks = (state, draftState, pageBlocks) => {
  const _blockArray = pageBlocks.map(
    block =>
      new ContentBlock({
        key: block._id,
        text: getRawHtmlForBlock(state, block),
        type: block.type,
      })
  )
  const contentState = ContentState.createFromBlockArray(_blockArray)
  return EditorState.push(draftState, contentState, 'insert-characters')
}

const DraftContentEditable = ({
  onActiveBlockIdChange,
  onActiveBlockContentChange,
  onEditorStateChange,
}) => {
  const [editorState] = useEditorContext()
  const { activeBlockId, draftState, blocks, page } = editorState

  // checks editor state for active block changed
  const checkSelectedBlockChanged = _nextDraftState => {
    const _nextActiveBlockId = _nextDraftState.getSelection().getFocusKey()
    if (_nextActiveBlockId !== activeBlockId) {
      onActiveBlockIdChange(_nextActiveBlockId, _nextDraftState)
      return true
    }
    return false
  }

  const checkActiveBlockContentChanged = _nextDraftState => {
    const _nextText = _nextDraftState
      .getCurrentContent()
      .getBlockForKey(activeBlockId)
      .getText()
    const _prevText = getRawHtmlForBlock(
      editorState,
      blocks[editorState.activeBlockId]
    )
    if (_nextText !== _prevText) {
      onActiveBlockContentChange(_nextText, _nextDraftState)
      return true
    }
    return false
  }

  const onChange = _state => {
    if (
      !checkSelectedBlockChanged(_state) &&
      !checkActiveBlockContentChanged(_state)
    ) {
      onEditorStateChange(_state)
    }
  }

  const blockRendererFn = () => ({
    component: DraftBlock,
    editable: true,
  })

  const _draftState =
    draftState ||
    setDraftStateBlocks(
      editorState,
      EditorState.createEmpty(),
      page.blocks.map(item => blocks[item._id])
    )

  return (
    <Editor
      editorState={_draftState}
      onChange={onChange}
      blockRendererFn={blockRendererFn}
    />
  )
}

export default DraftContentEditable
