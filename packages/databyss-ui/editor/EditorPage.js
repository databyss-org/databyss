import React, { useEffect } from 'react'
import _ from 'lodash'
import { useSourceContext } from '@databyss-org/services/sources/SourceProvider'
import { useNavigationContext } from '@databyss-org/ui/components/Navigation/NavigationProvider/NavigationProvider'
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
  cutBlocks,
  onPaste,
  onSetBlockRef,
  newBlockMenu,
  updateSource,
  removeSourceFromQueue,
  onSelection,
  addDirtyAtomic,
  dequeueDirtyAtomic,
} from './state/page/actions'

import { isBlockEmpty, isEmptyAndAtomic } from './slate/slateUtils'

const EditorPage = ({ children, autoFocus }) => {
  const [editorState, dispatchEditor] = useEditorContext()
  const { setSource, state: sourceState } = useSourceContext()

  const { sources, newSources, editableState, dirtyAtomics } = editorState

  /*
  checks to see if new source has been added
  adds the new source to the source provider
  */
  useEffect(
    () => {
      if (newSources && editableState) {
        if (newSources.length > 0) {
          newSources.forEach(s => {
            const _source = {
              _id: s._id,
              text: { textValue: s.textValue, ranges: s.ranges },
            }
            if (!sourceState.cache[s._id]) {
              setSource(_source)
            }
            dispatchEditor(removeSourceFromQueue(s._id))
          })
        }
      }
    },
    [sources]
  )

  useEffect(
    () => {
      if (dirtyAtomics) {
        // check atomic cache to see if atomic has been fetched
        const atomicData = Object.values(dirtyAtomics)
        atomicData.map(idData => {
          const _cache = { SOURCE: sourceState.cache }[idData.type]
          if (_.isObject(_cache[idData.refId])) {
            // remove from dirtyAtomics queue
            dispatchEditor(dequeueDirtyAtomic(idData.refId))
            // TODO:change to update atomic when topics provider is merged
            dispatchEditor(
              updateSource(_cache[idData.refId], { value: editableState.value })
            )

            // update
          }
        })
      }
    },
    [dirtyAtomics, sourceState]
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

  const onCutBlocks = (idList, newRef, newId, { value }) => {
    dispatchEditor(cutBlocks(idList, newRef, newId, { value }))
  }
  const onNewBlockMenu = (bool, { value }) => {
    dispatchEditor(newBlockMenu(bool, { value }))
  }

  const onPasteAction = (pasteData, { value }) => {
    dispatchEditor(onPaste(pasteData, { value }))
  }

  const setBlockRef = (id, ref, { value }) => {
    dispatchEditor(onSetBlockRef(id, ref, { value }))
  }

  const { showModal } = useNavigationContext()

  // dont need blocks
  const onEditSource = (refId, { value }) => {
    // Editor function to dispatch with modal
    const onUpdateSource = source => {
      if (source) {
        dispatchEditor(updateSource(source, { value }))
      }
    }
    showModal({
      component: 'SOURCE',
      props: {
        sourceId: refId,
        onUpdateSource,
      },
    })
  }

  const onSelectionChange = ({ value }) => {
    dispatchEditor(onSelection({ value }))
  }

  const onDirtyAtomic = (refId, type) => {
    dispatchEditor(addDirtyAtomic(refId, type))
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
    onCutBlocks,
    onPasteAction,
    setBlockRef,
    onNewBlockMenu,
    onEditSource,
    autoFocus,
    onSelectionChange,
    onDirtyAtomic,
  })
}

export default EditorPage
