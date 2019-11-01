import React, { useRef, useEffect } from 'react'
import { Value } from 'slate'
import { Editor } from 'slate-react'
import { getRawHtmlForBlock } from '../../state/line/reducer'
import { useEditorContext } from '../../EditorProvider'
import hotKeys, { START_OF_LINE, END_OF_LINE, TAB } from './../hotKeys'

import { toSlateJson, renderMark, getBlockRanges } from './../slateUtils'

const emptyValue = {
  document: {
    nodes: [
      {
        object: 'block',
        type: 'paragraph',
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
  onActiveBlockContentChange,
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
    if (
      !editorState.activeBlockId ||
      !activeBlockId ||
      !blocks[activeBlockId]
    ) {
      return false
    }

    const _prevText = getRawHtmlForBlock(editorState, blocks[activeBlockId])
    const _nextText = _nextEditableState.value.document.getNode(activeBlockId)
      .text

    if (_nextText !== _prevText) {
      const block = _nextEditableState.value.anchorBlock
      const ranges = getBlockRanges(block)
      onActiveBlockContentChange(_nextText, _nextEditableState, ranges)
      return { _nextText, _nextEditableState, ranges }
    }
    return false
  }

  const onChange = change => {
    const { value } = change
    if (onDocumentChange) {
      console.log('heres')
      onDocumentChange(value.document.toJSON())
    }

    const blockChanges = checkActiveBlockContentChanged({ value })
    if (!blockChanges) {
      console.log('two')
      onEditableStateChange({ value })
    }
  }

  const _editableState = editableState || Value.fromJSON(emptyValue)
  // editableState || Value.fromJSON(toSlateJson(editorState, initialTextValue))

  console.log(_editableState)
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
    />
  )
}

export default SlateContentEditable
