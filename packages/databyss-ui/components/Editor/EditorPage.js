import React from 'react'
import { useEditorContext } from './EditorProvider'

import {
  setActiveBlockId,
  setActiveBlockContent,
  setEditableState,
  setActiveBlockType,
  newBlock,
  backspace,
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

  const onEditableStateChange = editableState =>
    dispatchEditor(setEditableState(editableState))

  const onNewBlock = (blockProperties, editableState) => {
    dispatchEditor(newBlock(blockProperties, editableState))
  }

  const onBackspace = (blockProperties, editableState) => {
    dispatchEditor(backspace(blockProperties, editableState))
  }

  // should only have 1 child (e.g. DraftContentEditable or SlateContentEditable)
  return React.cloneElement(React.Children.only(children), {
    onActiveBlockIdChange,
    onActiveBlockContentChange,
    onEditableStateChange,
    onNewBlock,
    onBackspace,
  })
}

export default EditorPage
