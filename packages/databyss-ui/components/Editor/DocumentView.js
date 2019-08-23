import React from 'react'
import { useEditorContext } from './EditorProvider'
import ContentEditable from './ContentEditable'
import Block from './Block'
import {
  insertTextAtCaret,
  setActiveIndex,
  moveCaretLeft,
  moveCaretRight,
} from './state/actions'

const DocumentView = () => {
  const [state, dispatch] = useEditorContext()
  const onKeyDown = value => {
    if (value === 'ArrowRight') {
      dispatch(moveCaretRight())
    } else if (value === 'ArrowLeft') {
      dispatch(moveCaretLeft())
    } else {
      dispatch(insertTextAtCaret(value))
    }
  }
  const onActiveBlockIdChange = blockId => {
    const index = state.documentView.findIndex(d => d._id === blockId)
    dispatch(setActiveIndex(index))
  }

  return (
    <ContentEditable
      activeBlockId={state.documentView[state.activeIndex]._id}
      caretPosition={state.activeTextOffset}
      onActiveBlockIdChange={onActiveBlockIdChange}
      onKeyDown={onKeyDown}
    >
      {state.documentView.map(docItem => (
        <Block block={state.blocks[docItem._id]} key={docItem._id} />
      ))}
    </ContentEditable>
  )
}

export default DocumentView
