import React from 'react'
import { useEditorContext } from './EditorProvider'

import {
  setActiveBlockId,
  setActiveBlockContent,
  setEditableState,
  setBlockType,
  newActiveBlock,
  backspace,
  toggleMark,
} from './state/actions'

const EditorPage = ({ children }) => {
  const [editorState, dispatchEditor] = useEditorContext()

  const onActiveBlockIdChange = (id, editableState) =>
    dispatchEditor(setActiveBlockId(id, editableState))

  const onActiveBlockContentChange = (rawHtml, editableState, blockValue) => {
    dispatchEditor(setActiveBlockContent(rawHtml, editableState, blockValue))
  }

  const onEditableStateChange = editableState =>
    dispatchEditor(setEditableState(editableState))

  const onNewActiveBlock = (blockProperties, editableState) => {
    dispatchEditor(newActiveBlock(blockProperties, editableState))
  }

  const onBackspace = (blockProperties, editableState) => {
    dispatchEditor(backspace(blockProperties, editableState))
  }

  const onBlockBlur = (id, rawHtml, editableState) => {
    if (rawHtml.match(/^@/) && editorState.blocks[id].type !== 'SOURCE') {
      dispatchEditor(setBlockType('SOURCE', id, editableState))
    }
    if (rawHtml.match(/^#/) && editorState.blocks[id].type !== 'TOPIC') {
      dispatchEditor(setBlockType('TOPIC', id, editableState))
    }
  }

  const OnToggleMark = (mark, { value }) => {
    dispatchEditor(toggleMark(mark, { value }))
  }

  // should only have 1 child (e.g. DraftContentEditable or SlateContentEditable)
  return React.cloneElement(React.Children.only(children), {
    onActiveBlockIdChange,
    onActiveBlockContentChange,
    onEditableStateChange,
    onNewActiveBlock,
    onBackspace,
    onBlockBlur,
    OnToggleMark,
  })
}

export default EditorPage
