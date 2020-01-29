import React, { useEffect } from 'react'
import { useSourceContext } from '@databyss-org/services/sources/SourceProvider'
import { useTopicContext } from '@databyss-org/services/topics/TopicProvider'
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
  newBlockMenu,
  updateAtomic,
  removeAtomicFromQueue,
} from './state/page/actions'

import { isBlockEmpty, isEmptyAndAtomic } from './slate/slateUtils'

const EditorPage = ({ children, autoFocus }) => {
  const [editorState, dispatchEditor] = useEditorContext()
  const { setSource } = useSourceContext()
  const { setTopic } = useTopicContext()

  const { sources, topics, newAtomics, editableState } = editorState

  /*
  checks to see if new source has been added
  adds the new source to the source provider
  */

  useEffect(
    () => {
      if (!editableState) {
        return
      }
      if (newAtomics && newAtomics.length) {
        newAtomics.forEach(atomic => {
          const _data = {
            _id: atomic._id,
            text: { textValue: atomic.textValue, ranges: atomic.ranges },
          }
          ;({
            SOURCE: () => {
              setSource(_data)
            },
            TOPIC: () => {
              setTopic(_data)
            },
          }[atomic.type]())
          dispatchEditor(removeAtomicFromQueue(atomic._id))
        })
      }
    },
    [sources, topics]
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

  const { showModal } = useNavigationContext()

  const onEditAtomic = (refId, type, { value }) => {
    const onUpdate = atomic => {
      if (atomic) {
        dispatchEditor(updateAtomic({ atomic, type }, { value }))
      }
    }

    showModal({
      component: type,
      props: {
        onUpdate,
        refId,
      },
    })
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
    autoFocus,
    onEditAtomic,
  })
}

export default EditorPage
