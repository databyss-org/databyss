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
  updateSource,
  updateTopic,
  removeTopicFromQueue,
  removeSourceFromQueue,
} from './state/page/actions'

import { isBlockEmpty, isEmptyAndAtomic } from './slate/slateUtils'

const EditorPage = ({ children, autoFocus }) => {
  const [editorState, dispatchEditor] = useEditorContext()
  const { setSource } = useSourceContext()
  const { setTopic } = useTopicContext()

  const { sources, newSources, topics, newTopics, editableState } = editorState

  /*
  checks to see if new source has been added
  adds the new source to the source provider
  */

  useEffect(
    () => {
      if (editableState) {
        if (newSources) {
          if (newSources.length > 0) {
            newSources.forEach(s => {
              const _source = {
                _id: s._id,
                text: { textValue: s.textValue, ranges: s.ranges },
              }
              setSource(_source)
              dispatchEditor(removeSourceFromQueue(s._id))
            })
          }
        }

        if (newTopics) {
          if (newTopics.length > 0) {
            newTopics.forEach(t => {
              const _topic = {
                _id: t._id,
                text: { textValue: t.textValue, ranges: t.ranges },
              }
              setTopic(_topic)
              dispatchEditor(removeTopicFromQueue(t._id))
            })
          }
        }
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

  const onEditTopic = (refId, { value }) => {
    // Editor function to dispatch with modal
    console.log('in editor page', refId)
    const onUpdateTopic = topic => {
      if (topic) {
        dispatchEditor(updateTopic(topic, { value }))
      }
    }
    showModal({
      component: 'TOPIC',
      props: {
        topicId: refId,
        onUpdateTopic,
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
    onEditSource,
    onEditTopic,
    autoFocus,
  })
}

export default EditorPage
