import React, { useEffect } from 'react'
import { useEditorContext } from './EditorProvider'

import {
  setContent,
  setEditableState,
  toggleMark,
  hotKey,
} from './state/line/actions'

const EditorLine = ({ children, initialValue, onChange, value }) => {
  const [state, dispatch] = useEditorContext()

  // useEffect(
  //   () => {
  //     onChange(state)
  //   },
  //   [state]
  // )

  const onContentChange = (textValue, ranges, editableState) => {
    dispatch(setContent(textValue, ranges, editableState))
  }

  const onEditableStateChange = editableState =>
    dispatch(setEditableState(editableState))

  const OnToggleMark = (mark, { value }) => {
    dispatch(toggleMark(mark, { value }))
  }

  const onHotKey = (command, { value }) => {
    dispatch(hotKey(command, { value }))
  }

  // should only have 1 child (e.g. draft/ContentEditable or slate/ContentEditable)
  return React.cloneElement(React.Children.only(children), {
    onContentChange,
    onEditableStateChange,
    OnToggleMark,
    onHotKey,
    initialTextValue: value,
  })
}

export default EditorLine
