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
  hotKey,
  clearBlock,
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
    // check if block is empty
    // if empty replace block with virgin block
    if (rawHtml.length === 0 && id) {
      dispatchEditor(clearBlock(id, editableState))
    }

    if (rawHtml.match(/^@/) && editorState.blocks[id].type !== 'SOURCE') {
      onSetBlockType('SOURCE', id, editableState)
      // dispatchEditor(setBlockType('SOURCE', id, editableState))
    }
    if (rawHtml.match(/^#/) && editorState.blocks[id].type !== 'TOPIC') {
      onSetBlockType('TOPIC', id, editableState)
      //   dispatchEditor(setBlockType('TOPIC', id, editableState))
    }
  }

  const onSetBlockType = (type, id, editableState) => {
    dispatchEditor(setBlockType(type, id, editableState))
  }

  const OnToggleMark = (mark, { value }) => {
    dispatchEditor(toggleMark(mark, { value }))
  }

  const onHotKey = (command, { value }) => {
    dispatchEditor(hotKey(command, { value }))
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
    onHotKey,
    onSetBlockType,
  })
}

export default EditorPage
