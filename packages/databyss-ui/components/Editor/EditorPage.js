import React from 'react'
import { useEditorContext } from './EditorProvider'

import {
  setActiveBlockId,
  setActiveBlockContent,
  setEditableState,
  setBlockType,
  newActiveBlock,
  backspace,
} from './state/actions'

const EditorPage = ({ children }) => {
  const [editorState, dispatchEditor] = useEditorContext()

  const onActiveBlockIdChange = (id, editableState) =>
    dispatchEditor(setActiveBlockId(id, editableState))

  const onActiveBlockContentChange = (rawHtml, editableState) => {
    dispatchEditor(setActiveBlockContent(rawHtml, editableState))
  }

  const onEditableStateChange = editableState =>
    dispatchEditor(setEditableState(editableState))

  const onnewActiveBlock = (blockProperties, editableState) => {
    dispatchEditor(newActiveBlock(blockProperties, editableState))
  }

  const onBackspace = (blockProperties, editableState) => {
    dispatchEditor(backspace(blockProperties, editableState))
  }

  const onBlockBlur = (id, rawHtml, editableState) => {
    if (rawHtml.match(/^@/) && editorState.blocks[id].type !== 'SOURCE') {
      dispatchEditor(setBlockType('SOURCE', id, editableState, true))
    }
  }

  // should only have 1 child (e.g. DraftContentEditable or SlateContentEditable)
  return React.cloneElement(React.Children.only(children), {
    onActiveBlockIdChange,
    onActiveBlockContentChange,
    onEditableStateChange,
    onnewActiveBlock,
    onBackspace,
    onBlockBlur,
  })
}

export default EditorPage
