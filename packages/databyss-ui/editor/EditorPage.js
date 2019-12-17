import React, { useState, useEffect } from 'react'
import _ from 'lodash'
import { useSourceContext } from '@databyss-org/services/sources/SourceProvider'
import { useEditorContext } from './EditorProvider'
import { difference } from './difference'
import { entities } from './state/page/reducer'

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
  newBlockMenu,
} from './state/page/actions'

import { isBlockEmpty, isEmptyAndAtomic } from './slate/slateUtils'

const EditorPage = ({ children }) => {
  const [editorState, dispatchEditor] = useEditorContext()
  const [, setSource] = useSourceContext()

  const [sources, setSources] = useState(editorState.sources)

  /*
  checks to see if new source has been added
  adds the new source to the source provider
  */
  useEffect(
    () => {
      if (!_.isEqual(editorState.sources, sources)) {
        // check if sources added
        if (
          Object.keys(editorState.sources).length > Object.keys(sources).length
        ) {
          const _newSource = difference(editorState.sources, sources)
          const _refId = Object.keys(_newSource)[0]
          const _sourceFields = _newSource[_refId]
          // initialize with empty value
          const _source = {
            _id: _refId,
            text: {
              textValue: _sourceFields.textValue,
              ranges: _sourceFields.ranges,
            },
            citations: [{ textValue: '', ranges: [] }],
            authors: [{ firstName: '', lastName: '' }],
          }
          setSource(_source)
        }
        setSources(editorState.sources)
      }
    },
    [editorState]
  )

  const onActiveBlockIdChange = (id, editableState) =>
    dispatchEditor(setActiveBlockId(id, editableState))

  const onActiveBlockContentChange = (text, editableState, blockValue) => {
    dispatchEditor(setActiveBlockContent(text, editableState, blockValue))
  }

  const onEditableStateChange = editableState =>
    dispatchEditor(setEditableState(editableState))

  const onNewActiveBlock = (blockProperties, editableState) => {
    dispatchEditor(newActiveBlock(blockProperties, editableState))
  }

  const onBackspace = (blockProperties, editableState) => {
    dispatchEditor(backspace(blockProperties, editableState))
  }
  const onSetBlockType = (type, id, editableState, setState) => {
    dispatchEditor(setBlockType(type, id, editableState, setState))
  }

  const onBlockBlur = (id, text, editableState) => {
    // if empty replace block with virgin block
    if (text.length === 0 && id) {
      if (!isBlockEmpty(id, editableState)) {
        dispatchEditor(clearBlock(id, editableState))
      }
    }

    if (isEmptyAndAtomic(text)) {
      dispatchEditor(clearBlock(id, editableState))
    } else {
      if (text.trim().match(/^@/) && editorState.blocks[id].type !== 'SOURCE') {
        onSetBlockType('SOURCE', id, editableState)
      }
      if (text.trim().match(/^#/) && editorState.blocks[id].type !== 'TOPIC') {
        onSetBlockType('TOPIC', id, editableState)
      }
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
  const onNewBlockMenu = (bool, { value }) => {
    dispatchEditor(newBlockMenu(bool, { value }))
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
    onNewBlockMenu,
  })
}

export default EditorPage
