import React, { useRef } from 'react'
import { Editor, EditorState, ContentState, ContentBlock } from 'draft-js'
import DraftBlock from './DraftBlock'

const setEditorStateBlocks = (state, blocks) => {
  const _blockArray = blocks.map(
    block =>
      new ContentBlock({
        key: block._id,
        text: block.rawHtml,
        type: block.type,
      })
  )
  const contentState = ContentState.createFromBlockArray(_blockArray)
  return EditorState.push(state, contentState, 'insert-characters')
}

const DraftContentEditable = ({
  activeBlockId,
  onActiveBlockIdChange,
  onActiveBlockContentChange,
  onEditorStateChange,
  blocks,
  editorState,
}) => {
  const stateRef = useRef({
    activeBlockId,
    blocks,
  })

  // checks editor state for active block changed
  const checkSelectedBlockChanged = _nextEditorState => {
    const _nextActiveBlockId = _nextEditorState.getSelection().getFocusKey()
    if (_nextActiveBlockId !== stateRef.current.activeBlockId) {
      onActiveBlockIdChange(_nextActiveBlockId, _nextEditorState)
      return true
    }
    return false
  }

  const checkActiveBlockContentChanged = _nextEditorState => {
    const _nextText = _nextEditorState
      .getCurrentContent()
      .getBlockForKey(activeBlockId)
      .getText()
    const _prevText = stateRef.current.blocks.find(b => b._id === activeBlockId)
      .rawHtml
    // console.log('checkActiveBlockContentChanged', _prevText, _nextText)
    if (_nextText !== _prevText) {
      onActiveBlockContentChange(_nextText, _nextEditorState)
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

  const _editorState =
    editorState || setEditorStateBlocks(EditorState.createEmpty(), blocks)

  Object.assign(stateRef.current, {
    activeBlockId,
    blocks,
  })

  return (
    <Editor
      editorState={_editorState}
      onChange={onChange}
      blockRendererFn={blockRendererFn}
    />
  )
}

export default DraftContentEditable
