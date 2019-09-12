import React, { useRef, useEffect } from 'react'
import { KeyUtils, Value } from 'slate'
import ObjectId from 'bson-objectid'
import { Editor } from 'slate-react'
import EditorBlock from '../EditorBlock'
import EditorInline from '../EditorInline'
import { getRawHtmlForBlock } from '../state/reducer'
import { findActiveBlock } from './reducer'
import { useEditorContext } from '../EditorProvider'

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
  const isFocused = editor.value.selection.focus.isInNode(node)
  if (node.type === 'SOURCE') {
    return (
      <EditorInline isFocused={isFocused} {...attributes}>
        {node.text}
      </EditorInline>
    )
  }

  return next()
}

const renderBlock = ({ node, children }) => (
  <EditorBlock type={node.type}>{children}</EditorBlock>
)

const SlateContentEditable = ({
  onActiveBlockIdChange,
  onActiveBlockContentChange,
  onEditableStateChange,
  onNewActiveBlock,
  onBackspace,
  onBlockBlur,
  onDocumentChange,
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

  const onChange = ({ value }) => {
    if (onDocumentChange) {
      onDocumentChange(value.document.toJSON())
    }
    if (
      !checkSelectedBlockChanged({ value }) &&
      !checkActiveBlockContentChanged({ value })
    ) {
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
      // IF WE HAVE ATOMIC BLOCK HIGHLIGHTED
      // PREVENT NEW BLOCK
      if (
        editor.value.anchorBlock.type === 'SOURCE' &&
        !editor.value.selection.focus.isAtStartOfNode(
          editor.value.anchorBlock
        ) &&
        !editor.value.selection.focus.isAtEndOfNode(editor.value.anchorBlock)
      ) {
        return event.preventDefault()
      }

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

        // IF WE HAVE ATOMIC BLOCK HIGHLIGHTED
        // PREVENT ENTER KEY
        if (
          event.key === 'Enter' &&
          !editor.value.selection.focus.isAtStartOfNode(
            editor.value.anchorBlock
          ) &&
          !editor.value.selection.focus.isAtEndOfNode(editor.value.anchorBlock)
        ) {
          return event.preventDefault()
        }

        return next()
      }
      return event.preventDefault()
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
    />
  )
}

export default SlateContentEditable
