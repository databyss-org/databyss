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
  deleteBlock,
  deleteBlocks,
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
  const onSetBlockType = (type, id, editableState) => {
    dispatchEditor(setBlockType(type, id, editableState))
  }

  const onBlockBlur = (id, rawHtml, editableState) => {
    // check if block is empty
    // if empty replace block with virgin block
    if (rawHtml.length === 0 && id) {
      // check block to see if ranges exist
      console.log('here')
      dispatchEditor(clearBlock(id, editableState))
    }

    if (
      rawHtml.trim().match(/^@/) &&
      editorState.blocks[id].type !== 'SOURCE'
    ) {
      onSetBlockType('SOURCE', id, editableState)
    }
    if (rawHtml.trim().match(/^#/) && editorState.blocks[id].type !== 'TOPIC') {
      onSetBlockType('TOPIC', id, editableState)
    }
  }

  const OnToggleMark = (mark, { value }) => {
    dispatchEditor(toggleMark(mark, { value }))
  }

  const onHotKey = (command, { value }) => {
    dispatchEditor(hotKey(command, { value }))
  }

  const deleteBlockByKey = (id, { value }) => {
    dispatchEditor(deleteBlock(id, { value }))
  }
  const deleteBlocksByKeys = (idList, { value }) => {
    dispatchEditor(deleteBlocks(idList, { value }))
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
    deleteBlockByKey,
    deleteBlocksByKeys,
  })
}

export default EditorPage
