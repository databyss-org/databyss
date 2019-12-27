import React, { useEffect } from 'react'
import { useSourceContext } from '@databyss-org/services/sources/SourceProvider'
import { useNavigationContext } from '@databyss-org/ui/components/Navigation/NavigationProvider/NavigationProvider'
import { showModal } from '@databyss-org/ui/components/Navigation/NavigationProvider/actions'
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
  newBlockMenu,
  updateSource,
} from './state/page/actions'

import { isBlockEmpty, isEmptyAndAtomic } from './slate/slateUtils'

const EditorPage = ({ children, autoFocus }) => {
  const [editorState, dispatchEditor] = useEditorContext()
  const { setSource, getSources } = useSourceContext()

  const { sources } = editorState
  /*
  checks to see if new source has been added
  adds the new source to the source provider
  */
  useEffect(
    () => {
      const _sourceDictionary = getSources()
      const _sources = Object.keys(sources)
      _sources.forEach(_refId => {
        if (!_sourceDictionary[_refId]) {
          const _sourceFields = sources[_refId]
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
      })
    },
    [sources]
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
  const onSetBlockType = (type, id, editableState) => {
    dispatchEditor(setBlockType(type, id, editableState))
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
      showModal({
        component: 'SOURCE',
        props: {
          sourceId: refId,
          onUpdateSource,
        },
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
    autoFocus,
  })
}

export default EditorPage
