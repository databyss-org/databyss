import React from 'react'
import { useEditorContext } from './EditorProvider'
import DraftContentEditable from './DraftContentEditable'

import {
  setActiveBlockId,
  setActiveBlockContent,
  setEditorState,
  setActiveBlockType,
} from './state/actions'

const DocumentView = () => {
  const [state, dispatch] = useEditorContext()
  const onActiveBlockIdChange = (id, editorState) =>
    dispatch(setActiveBlockId(id, editorState))
  const onActiveBlockContentChange = (rawHtml, editorState) => {
    if (
      rawHtml.match(/^#/) &&
      state.blocks[state.activeBlockId].type !== 'HEADER'
    ) {
      dispatch(setActiveBlockType('HEADER'))
    } else if (
      rawHtml.match(/^@/) &&
      state.blocks[state.activeBlockId].type !== 'RESOURCE'
    ) {
      dispatch(setActiveBlockType('RESOURCE'))
    } else {
      dispatch(setActiveBlockContent(rawHtml, editorState))
    }
  }
  const onEditorStateChange = editorState =>
    dispatch(setEditorState(editorState))

  return (
    <DraftContentEditable
      activeBlockId={state.activeBlockId}
      onActiveBlockIdChange={onActiveBlockIdChange}
      onActiveBlockContentChange={onActiveBlockContentChange}
      onEditorStateChange={onEditorStateChange}
      blocks={state.documentView.map(item => state.blocks[item._id])}
      editorState={state.editorState}
    />
  )
}

export default DocumentView
