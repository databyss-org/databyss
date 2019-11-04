import React, { useRef, useEffect } from 'react'
import { Value } from 'slate'
import { Editor } from 'slate-react'
import { lineStateToSlate } from './../markup'

import { useEditorContext } from '../../EditorProvider'
import hotKeys, { editorHotKeys } from './../hotKeys'

import { renderMark, getBlockRanges, renderBlock } from './../slateUtils'

const initalValue = node => ({
  document: {
    nodes: [node],
  },
})

const SlateContentEditable = ({
  onContentChange,
  onEditableStateChange,
  onDocumentChange,
  OnToggleMark,
  onHotKey,
  css,
}) => {
  const [editorState] = useEditorContext()

  const { editableState, textValue } = editorState

  const editableRef = useRef(null)

  // checks editor state for active block content changed
  const checkActiveBlockContentChanged = _nextEditableState => {
    // on first click on change returns null values for anchor block
    if (!_nextEditableState.value.anchorBlock) {
      return false
    }
    if (!textValue) {
      const _text = _nextEditableState.value.anchorBlock.text
      return { _text }
    }

    const _text = _nextEditableState.value.anchorBlock.text
    if (textValue !== _text) {
      const _ranges = getBlockRanges(_nextEditableState.value.anchorBlock)
      return { _text, _ranges }
    }
    // TODO
    // if markup is applied to selection. update state range
    return false
  }

  const onChange = change => {
    const { value } = change
    if (onDocumentChange) {
      onDocumentChange(value.document.toJSON())
    }
    const blockChanges = checkActiveBlockContentChanged({ value })
    if (blockChanges) {
      const { _text, _ranges } = blockChanges
      onContentChange(_text, _ranges, { value })
    } else {
      onEditableStateChange({ value })
    }
  }

  const _editableState = editableState || {
    value: Value.fromJSON(initalValue(lineStateToSlate(editorState))),
  }

  useEffect(
    () =>
      _editableState.editorCommands &&
      _editableState.editorCommands(
        editableRef.current,
        _editableState.value,
        () => editableRef.current.controller.flush()
      )
  )

  const onKeyDown = (event, editor, next) => {
    if (event.key === 'Enter') {
      editor.insertText('\n')
      return event.preventDefault()
    }

    editorHotKeys(event, editor, onHotKey, OnToggleMark)

    if (hotKeys.isLocation(event)) {
      event.preventDefault()
      OnToggleMark('location', editor)
    }

    return next()
  }

  return (
    <Editor
      value={_editableState.value}
      ref={editableRef}
      onChange={onChange}
      onKeyDown={onKeyDown}
      renderMark={renderMark}
      renderBlock={renderBlock}
      css={css}
    />
  )
}

export default SlateContentEditable
