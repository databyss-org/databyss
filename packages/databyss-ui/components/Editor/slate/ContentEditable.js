import React, { useRef, useEffect } from 'react'
import { KeyUtils, Value } from 'slate'
import ObjectId from 'bson-objectid'
import { Editor } from 'slate-react'
import EditorBlock from '../EditorBlock'
import { getRawHtmlForBlock } from '../state/reducer'
import { findActiveBlock } from './reducer'
import { useEditorContext } from '../EditorProvider'
import hotKeys from './hotKeys'

KeyUtils.setGenerator(() => ObjectId().toHexString())

const toSlateJson = (editorState, pageBlocks) => ({
  document: {
    nodes: pageBlocks.map(block => {
      const textBlock =
        block.type === 'SOURCE'
          ? {
              object: 'inline',
              nodes: [
                {
                  object: 'text',
                  text: getRawHtmlForBlock(editorState, block),
                },
              ],
              type: block.type,
            }
          : {
              object: 'text',
              text: getRawHtmlForBlock(editorState, block),
            }
      return {
        object: 'block',
        key: block._id,
        type: block.type,
        nodes: [textBlock],
      }
    }),
  },
})

const schema = {
  inlines: {
    SOURCE: {
      isVoid: true,
    },
  },
}

const renderInline = ({ node, attributes }, editor, next) => {
  const isSelected = editor.value.selection.focus.isInNode(node)
  const style = isSelected
    ? {
        backgroundColor: '#efefef',
      }
    : {}
  if (node.type === 'SOURCE') {
    return (
      <span style={style} {...attributes}>
        {node.text}
      </span>
    )
  }

  return next()
}

const renderBlock = ({ node, children }) => (
  <EditorBlock type={node.type}>{children}</EditorBlock>
)

const renderMark = (props, editor, next) => {
  const { children, mark, attributes } = props
  switch (mark.type) {
    case 'bold':
      return <strong {...attributes}>{children}</strong>
    case 'italic':
      return <i {...attributes}>{props.children}</i>
    default:
      return next()
  }
}

const SlateContentEditable = ({
  onActiveBlockIdChange,
  onActiveBlockContentChange,
  onEditableStateChange,
  onNewActiveBlock,
  onBackspace,
  onBlockBlur,
  onDocumentChange,
  OnToggleMark,
}) => {
  const [editorState] = useEditorContext()

  const { activeBlockId, editableState, blocks, page } = editorState

  const editableRef = useRef(null)

  const checkSelectedBlockChanged = _nextEditableState => {
    const _nextActiveBlock = findActiveBlock(_nextEditableState.value)
    if (!_nextActiveBlock) {
      return false
    }

    if (_nextActiveBlock.key !== activeBlockId) {
      let rawHtml = ''
      if (_nextEditableState.value.document.getNode(activeBlockId)) {
        rawHtml = _nextEditableState.value.document.getNode(activeBlockId).text
      }

      onBlockBlur(activeBlockId, rawHtml, _nextEditableState)
      onActiveBlockIdChange(_nextActiveBlock.key, _nextEditableState)
      return true
    }
    return false
  }

  // checks editor state for active block content changed
  const checkActiveBlockContentChanged = _nextEditableState => {
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
      onActiveBlockContentChange(_nextText, _nextEditableState)
      return true
    }
    return false
  }

  const onChange = change => {
    const { value } = change
    if (onDocumentChange) {
      onDocumentChange(value.document.toJSON())
    }
    if (
      !checkSelectedBlockChanged({ value }) &&
      !checkActiveBlockContentChanged({ value })
    ) {
      // SOMETHING GOING WRONG HERE
      onEditableStateChange({ value })
    }
  }

  const _editableState = editableState || {
    value: Value.fromJSON(
      toSlateJson(editorState, page.blocks.map(item => blocks[item._id]))
    ),
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

  const onKeyUp = (event, editor, next) => {
    if (event.key === 'Enter') {
      const blockProperties = {
        insertedBlockId: editor.value.anchorBlock.key,
        insertedBlockText: editor.value.anchorBlock.text,
        previousBlockId: editor.value.previousBlock.key,
        previousBlockText: editor.value.previousBlock.text,
      }
      const editorState = { value: editor.value }
      onNewActiveBlock(blockProperties, editorState)
    }

    if (event.key === 'Backspace') {
      const blockProperties = {
        activeBlockId: editor.value.anchorBlock.key,
        nextBlockId: editor.value.nextBlock ? editor.value.nextBlock.key : null,
      }
      const editorState = { value: editor.value }
      onBackspace(blockProperties, editorState)
    }
    // special case:
    // if cursor is immediately before or after the atomic source in a
    // SOURCE block, prevent all
    return next()
  }

  const onKeyDown = (event, editor, next) => {
    if (editor.value.anchorBlock.type === 'SOURCE') {
      if (
        event.key === 'Backspace' ||
        event.key === 'Enter' ||
        event.key === 'ArrowLeft' ||
        event.key === 'ArrowRight' ||
        event.key === 'ArrowUp' ||
        event.key === 'ArrowDown'
      ) {
        if (event.key === 'Backspace' && editor.value.previousBlock.text) {
          if (
            !editor.value.selection.focus.isAtStartOfNode(
              editor.value.anchorBlock
            )
          ) {
            return next()
          }
          return event.preventDefault()
        }
        return next()
      }
      return event.preventDefault()
    }

    if (hotKeys.isBold(event)) {
      event.preventDefault()
      OnToggleMark('bold', editor)
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
      renderBlock={renderBlock}
      renderInline={renderInline}
      schema={schema}
      onKeyUp={onKeyUp}
      onKeyDown={onKeyDown}
      renderMark={renderMark}
    />
  )
}

export default SlateContentEditable
