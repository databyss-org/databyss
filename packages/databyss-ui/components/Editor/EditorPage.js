import React from 'react'
import { useEditorContext } from './EditorProvider'

import {
  setActiveBlockId,
  setActiveBlockContent,
  setDraftState,
  setActiveBlockType,
} from './state/actions'

const EditorPage = ({ children }) => {
  const [editorState, dispatchEditor] = useEditorContext()
  const onActiveBlockIdChange = (id, editableState) =>
    dispatchEditor(setActiveBlockId(id, editableState))
  const onActiveBlockContentChange = (rawHtml, editableState) => {
    if (
      rawHtml.match(/^@/) &&
      editorState.blocks[editorState.activeBlockId].type !== 'SOURCE'
    ) {
      dispatchEditor(setActiveBlockType('SOURCE', editableState, true))
    } else {
      dispatchEditor(setActiveBlockContent(rawHtml, editableState))
    }
  }
  const onEditorStateChange = editableState =>
    dispatchEditor(setDraftState(editableState))

  // should only have 1 child (e.g. DraftContentEditable or SlateContentEditable)
  return React.cloneElement(React.Children.only(children), {
    onActiveBlockIdChange,
    onActiveBlockContentChange,
    onEditorStateChange,
  })
}

export default EditorPage
