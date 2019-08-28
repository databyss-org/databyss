import React from 'react'
import { useEditorContext } from './DraftEditorProvider'
import DraftContentEditable from './DraftContentEditable'

import {
  setActiveBlockId,
  setActiveBlockContent,
  setDraftState,
  setActiveBlockType,
} from './state/actions'

const Page = () => {
  const [editorState, dispatchEditor] = useEditorContext()
  const onActiveBlockIdChange = (id, draftState) =>
    dispatchEditor(setActiveBlockId(id, draftState))
  const onActiveBlockContentChange = (rawHtml, draftState) => {
    if (
      rawHtml.match(/^@/) &&
      editorState.blocks[editorState.activeBlockId].type !== 'SOURCE'
    ) {
      dispatchEditor(setActiveBlockType('SOURCE', draftState, true))
    } else {
      dispatchEditor(setActiveBlockContent(rawHtml, draftState))
    }
  }
  const onEditorStateChange = draftState =>
    dispatchEditor(setDraftState(draftState))

  return (
    <DraftContentEditable
      onActiveBlockIdChange={onActiveBlockIdChange}
      onActiveBlockContentChange={onActiveBlockContentChange}
      onEditorStateChange={onEditorStateChange}
    />
  )
}

export default Page
