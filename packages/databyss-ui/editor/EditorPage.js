import React, { useState, useEffect } from 'react'
import _ from 'lodash'
import { useSourceContext } from '@databyss-org/services/sources/SourceProvider'
import { useNavigationContext } from '@databyss-org/ui/components/Navigation/NavigationProvider/NavigationProvider'
import { showModal } from '@databyss-org/ui/components/Navigation/NavigationProvider/actions'
import { useEditorContext } from './EditorProvider'
import { difference } from './difference'

// generic stuff in services/lib

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
  updateSource,
} from './state/page/actions'

import { isBlockEmpty, isEmptyAndAtomic } from './slate/slateUtils'

const EditorPage = ({ children }) => {
  const [editorState, dispatchEditor] = useEditorContext()
  const [getSource, setSource] = useSourceContext()
  // turn the set and get as object properties
  // add getSources as third source and use that to compare

  // make this a use ref instead
  const [sources, setSources] = useState(editorState.sources)

  /*
  checks to see if new source has been added
  adds the new source to the source provider
  */

  useEffect(
    () => {
      const _sources = Object.keys(editorState.sources)
      _sources.forEach(_refId => {
        console.log(getSource(_refId))
        if (!getSource(_refId)) {
          // get properties
          const _sourceFields = editorState.sources[_refId]
          const _source = {
            _id: _refId,
            text: {
              textValue: _sourceFields.textValue,
              ranges: _sourceFields.ranges,
            },
            citations: [{ textValue: '', ranges: [] }],
            authors: [{ firstName: '', lastName: '' }],
          }
          //  console.log(_source)
          // setSource(_source)
        }
        // console.log(getSource(source))
      })
      //  console.log(Object.keys(editorState.sources))
      // if (!_.isEqual(editorState.sources, sources)) {
      //   // check if sources added
      //   if (
      //     Object.keys(editorState.sources).length > Object.keys(sources).length
      //   ) {
      //     const _newSource = difference(editorState.sources, sources)
      //     const _refId = Object.keys(_newSource)[0]
      //     const _sourceFields = _newSource[_refId]
      //     // initialize with empty value
      //     const _source = {
      //       _id: _refId,
      //       text: {
      //         textValue: _sourceFields.textValue,
      //         ranges: _sourceFields.ranges,
      //       },
      //       citations: [{ textValue: '', ranges: [] }],
      //       authors: [{ firstName: '', lastName: '' }],
      //     }
      //     setSource(_source)
      //   }
      //   setSources(editorState.sources)
      // }
    },
    // update this to just sources
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

  const [, dispatchNav] = useNavigationContext()

  const onEditSource = (refId, blocks, { value }) => {
    // Editor function to dispatch with modal
    const onUpdateSource = source => {
      // return a list of blocks containing the source that will be updated
      if (source) {
        const _idList = Object.keys(blocks).filter(
          block => blocks[block].refId === source._id
        )
        dispatchEditor(updateSource(source, _idList, { value }))
      }
    }
    dispatchNav(
      showModal('SOURCE', {
        sourceId: refId,
        onUpdateSource,
      })
    )
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
    onEditSource,
  })
}

export default EditorPage
