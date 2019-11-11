import React, { useEffect } from 'react'
import { useEditorContext } from './EditorProvider'

import {
  setContent,
  setEditableState,
  toggleMark,
  hotKey,
} from './state/line/actions'

const EditorLine = ({ children, onChange, value }) => {
  const [state, dispatch] = useEditorContext()
  const { textValue, ranges } = state

  useEffect(
    () => {
      if (onChange) {
        onChange({ textValue, ranges })
      }
    },
    [state]
  )

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

  const overrideCss = children.props.overrideCss
  // TODO: CSS GETS OVERRIDDEN HERE
  return React.cloneElement(React.Children.only(children), {
    overrideCss,
    onContentChange,
    onEditableStateChange,
    OnToggleMark,
    onHotKey,
    initialTextValue: value,
  })
}

export default EditorLine
