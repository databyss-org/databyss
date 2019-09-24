import React, { useRef, useEffect } from 'react'
import { KeyUtils, Value, Block } from 'slate'
import ObjectId from 'bson-objectid'
import { Editor } from 'slate-react'
import xss from 'xss'

import EditorBlock from '../EditorBlock'
// import EditorInline from '../EditorInline'
import { getRawHtmlForBlock, entities } from '../state/reducer'
import { findActiveBlock, isAtomicInlineType } from './reducer'
import { useEditorContext } from '../EditorProvider'
import hotKeys from './hotKeys'
import { serializeNodeToHtml } from './inlineSerializer'
import { stateToSlate, getRangesFromBlock } from './markup'

KeyUtils.setGenerator(() => ObjectId().toHexString())

const toSlateJson = (editorState, pageBlocks) => ({
  document: {
    nodes: pageBlocks.map(block => {
      let nodes = []
      switch (block.type) {
        case 'ENTRY':
          nodes = stateToSlate(
            {
              [block.refId]: editorState.entries[block.refId],
            },
            block._id
          )
          break
        default:
          break
      }

      const nodeWithRanges = stateToSlate({
        [block.refId]: entities(editorState, block.type)[block.refId],
      }).nodes

      const _block = Block.fromJSON({
        object: 'block',
        type: block.type,
        nodes: nodeWithRanges,
      })

      const _innerHtml = serializeNodeToHtml(_block)

      const textBlock = isAtomicInlineType(block.type)
        ? {
            object: 'inline',
            nodes: [
              {
                object: 'text',
                text: _innerHtml,
              },
            ],
            type: block.type,
          }
        : {
            object: 'text',
            text: getRawHtmlForBlock(editorState, block),
          }

      // this will return generic nod
      return block.type === 'ENTRY'
        ? nodes
        : {
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
    TOPIC: {
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

  const _text = xss(node.text, {
    whiteList: [],
    stripIgnoreTag: false,
    stripIgnoreTagBody: ['script'],
  })

  console.log(_text)

  if (isAtomicInlineType(node.type)) {
    return (
      <span
        style={style}
        {...attributes}
        dangerouslySetInnerHTML={{ __html: _text }}
      />
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

    if (isAtomicInlineType(_nextEditableState.value.anchorBlock.type)) {
      return false
    }

    if (_nextText !== _prevText) {
      const block = _nextEditableState.value.anchorBlock
      const jsonBlockValue = { ...block.toJSON(), key: block.key }
      const ranges = getRangesFromBlock(jsonBlockValue).ranges
      onActiveBlockContentChange(_nextText, _nextEditableState, ranges)
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
        isAtomicInlineType(editor.value.anchorBlock.type) &&
        !editor.value.selection.focus.isAtStartOfNode(
          editor.value.anchorBlock
        ) &&
        !editor.value.selection.focus.isAtEndOfNode(editor.value.anchorBlock)
      ) {
        return event.preventDefault()
      }
      // if its atomic get text value from state
      const blockProperties = {
        insertedBlockId: editor.value.anchorBlock.key,
        insertedBlockText: editor.value.anchorBlock.text,
        previousBlockId: editor.value.previousBlock.key,
        previousBlockText: editor.value.previousBlock.text,
      }
      const _editorState = { value: editor.value }
      onNewActiveBlock(blockProperties, _editorState)
    }

    if (event.key === 'Backspace') {
      // TODO when cursor is at the beginning of an entry and previous block is empty remove previous block
      const blockProperties = {
        activeBlockId: editor.value.anchorBlock.key,
        nextBlockId: editor.value.nextBlock ? editor.value.nextBlock.key : null,
      }
      const _editorState = { value: editor.value }
      onBackspace(blockProperties, _editorState)
    }
    // special case:
    // if cursor is immediately before or after the atomic source in a
    // SOURCE block, prevent all
    return next()
  }

  const onKeyDown = (event, editor, next) => {
    if (isAtomicInlineType(editor.value.anchorBlock.type)) {
      if (
        event.key === 'Backspace' ||
        event.key === 'Enter' ||
        event.key === 'ArrowLeft' ||
        event.key === 'ArrowRight' ||
        event.key === 'ArrowUp' ||
        event.key === 'ArrowDown'
      ) {
        // if previous block doesnt exist
        if (!editor.value.previousBlock) {
          return next()
        }
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
