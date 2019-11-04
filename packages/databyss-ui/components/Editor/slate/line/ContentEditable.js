import React, { useRef, useEffect } from 'react'
import { Value } from 'slate'
import { Editor } from 'slate-react'
import { getRawHtmlForBlock } from '../../state/line/reducer'
import { getRangesFromBlock } from './../markup'

import { useEditorContext } from '../../EditorProvider'
import hotKeys, { START_OF_LINE, END_OF_LINE, TAB } from './../hotKeys'

import {
  toSlateJson,
  renderMark,
  getBlockRanges,
  renderBlock,
} from './../slateUtils'

const emptyValue = {
  document: {
    nodes: [
      {
        object: 'block',
        type: 'TEXT',
        nodes: [
          {
            object: 'text',
            text: '',
          },
        ],
      },
    ],
  },
}

const SlateContentEditable = ({
  onContentChange,
  onEditableStateChange,
  onDocumentChange,
  OnToggleMark,
  onHotKey,
}) => {
  const [editorState] = useEditorContext()

  const { editableState, textValue, ranges } = editorState

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

  const _editableState = editableState
    ? editableState
    : { value: Value.fromJSON(emptyValue) }

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

    if (hotKeys.isStartOfLine(event)) {
      event.preventDefault()
      onHotKey(START_OF_LINE, editor)
    }

    if (hotKeys.isEndOfLine(event)) {
      event.preventDefault()
      onHotKey(END_OF_LINE, editor)
    }

    if (hotKeys.isTab(event)) {
      event.preventDefault()
      onHotKey(TAB, editor)
    }

    if (hotKeys.isBold(event)) {
      event.preventDefault()
      OnToggleMark('bold', editor)
    }

    if (hotKeys.isLocation(event)) {
      event.preventDefault()
      OnToggleMark('location', editor)
    }

    if (hotKeys.isItalic(event)) {
      event.preventDefault()
      OnToggleMark('italic', editor)
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
    />
  )
}

export default SlateContentEditable
